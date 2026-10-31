import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType, ReportReason } from '@pleingaz/database';
import * as crypto from 'crypto';

export interface MetaWebhookLog {
  id: string;
  timestamp: string;
  fromPhone: string;
  messageText: string;
  signatureValid: boolean;
  challengeConsumed: boolean;
  challengeCode?: string;
  rawPayload?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly metaAppSecret = process.env.META_WA_APP_SECRET || 'pleingaz_meta_secret_key_2026';
  private readonly metaVerifyToken = process.env.META_WA_VERIFY_TOKEN || 'PLEINGAZ_META_WA_VERIFY_TOKEN';
  private readonly officialWaNumber = process.env.PLEINGAZ_WHATSAPP_NUMBER || '+237657696567';

  // Mémoire circulaire pour le monitoring en temps réel des webhooks
  private recentWebhooks: MetaWebhookLog[] = [];

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  /**
   * 1. Handshake GET Meta Cloud API
   */
  verifyMetaWebhookChallenge(mode: string, verifyToken: string, challenge: string): string {
    if (mode === 'subscribe' && verifyToken === this.metaVerifyToken) {
      this.logger.log(`[Meta Webhook] Handshake GET validé avec succès (hub.challenge renvoyé)`);
      return challenge;
    }
    this.logger.warn(`[Meta Webhook] Handshake rejeté : mode=${mode}, token=${verifyToken}`);
    throw new ForbiddenException('Meta Webhook verification failed: invalid token or mode');
  }

  /**
   * 2. Vérification cryptographique HMAC SHA-256 (Menace M24 anti-spoofing)
   */
  verifyMetaSignature(rawBody: string, signatureHeader?: string): boolean {
    if (!signatureHeader) {
      return false;
    }

    const [scheme, signature] = signatureHeader.split('=');
    if (scheme !== 'sha256' || !signature) {
      return false;
    }

    const expectedHash = crypto
      .createHmac('sha256', this.metaAppSecret)
      .update(rawBody)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * 3. Réception et traitement du Webhook entrant Meta WhatsApp (D-12, M24)
   */
  async processIncomingMetaWebhook(rawBody: string, payload: any, signatureHeader?: string): Promise<{ success: boolean; processed: number; details: any[] }> {
    // Si une signature est envoyée, vérification obligatoire stricte
    if (signatureHeader) {
      const isValid = this.verifyMetaSignature(rawBody, signatureHeader);
      if (!isValid) {
        this.logger.error(`[Meta Webhook] ALERTE M24 : Signature HMAC invalide reçue ! Rejet immédiat.`);
        throw new UnauthorizedException('Signature HMAC SHA-256 invalide');
      }
    }

    const details: any[] = [];
    let processedCount = 0;

    // Structure Meta Cloud API standard
    const entries = payload?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages || [];

        for (const msg of messages) {
          processedCount++;
          const fromRaw = msg.from; // Ex: '237699123456'
          const fromPhone = fromRaw?.startsWith('+') ? fromRaw : `+${fromRaw}`;
          const textBody = msg.text?.body?.trim() || '';

          // Extraction éventuelle d'un code de validation (ex: VERIF-123456 ou code 6 chiffres)
          const codeMatch = textBody.match(/(?:VERIF|CONNEX|PLEINGAZ)-([A-Z0-9]{4,8})/i) || textBody.match(/\b([A-Z0-9]{6})\b/i);
          const detectedCode = codeMatch ? (codeMatch[1] || codeMatch[0]) : null;

          let challengeConsumed = false;

          if (detectedCode) {
            // Recherche du challenge actif pour ce téléphone
            const activeChallenge = await this.prisma.verificationChallenge.findFirst({
              where: {
                phone: fromPhone,
                expiresAt: { gt: new Date() },
                consumedAt: null,
              },
              orderBy: { createdAt: 'desc' },
            });

            if (activeChallenge) {
              // Vérification du code (codeHash ou matching textuel)
              const matches = activeChallenge.codeHash.includes(detectedCode) || detectedCode.includes(activeChallenge.codeHash);
              if (matches || activeChallenge.codeHash === detectedCode) {
                await this.prisma.verificationChallenge.update({
                  where: { id: activeChallenge.id },
                  data: { consumedAt: new Date() },
                });
                challengeConsumed = true;
                this.logger.log(`[Meta Webhook] D-12 Succès : Défi WhatsApp consommé pour ${fromPhone} (code: ${detectedCode})`);
              }
            }
          }

          // Enregistrement dans le journal mémoire pour surveillance
          const logEntry: MetaWebhookLog = {
            id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            fromPhone,
            messageText: textBody,
            signatureValid: true,
            challengeConsumed,
            challengeCode: detectedCode || undefined,
            rawPayload: msg,
          };

          this.recentWebhooks.unshift(logEntry);
          if (this.recentWebhooks.length > 50) this.recentWebhooks.pop();

          details.push(logEntry);
        }
      }
    }

    return {
      success: true,
      processed: processedCount,
      details,
    };
  }

  /**
   * 4. Création d'un Défi Entrant WhatsApp (D-12)
   */
  async createWhatsAppChallenge(phone: string, purpose = 'LOGIN'): Promise<{
    challengeId: string;
    phone: string;
    code: string;
    waLink: string;
    expiresAt: Date;
  }> {
    const cleanPhone = phone.startsWith('+') ? phone.trim() : `+237${phone.replace(/^0+/, '').trim()}`;
    const codeNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const code = `VERIF-${codeNumber}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const challenge = await this.prisma.verificationChallenge.create({
      data: {
        phone: cleanPhone,
        codeHash: codeNumber, // Enregistré pour matching
        purpose,
        channel: 'WHATSAPP',
        expiresAt,
      },
    });

    const cleanWaNumber = this.officialWaNumber.replace('+', '');
    const waLink = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Bonjour PLEINGAZ, voici mon code de vérification : ${code}`)}`;

    return {
      challengeId: challenge.id,
      phone: cleanPhone,
      code,
      waLink,
      expiresAt,
    };
  }

  /**
   * 5. Vérification d'état d'un Défi WhatsApp
   */
  async checkWhatsAppChallenge(phone: string): Promise<{ verified: boolean; consumedAt?: Date | null; expired: boolean }> {
    const cleanPhone = phone.startsWith('+') ? phone.trim() : `+237${phone.replace(/^0+/, '').trim()}`;
    const challenge = await this.prisma.verificationChallenge.findFirst({
      where: { phone: cleanPhone },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return { verified: false, expired: true };
    }

    const isExpired = challenge.expiresAt < new Date();
    return {
      verified: !!challenge.consumedAt,
      consumedAt: challenge.consumedAt,
      expired: isExpired && !challenge.consumedAt,
    };
  }

  /**
   * 6. Simulateur de Webhook Meta entrant pour tests et démos
   */
  async simulateIncomingWebhookMessage(fromPhone: string, textBody: string, validSignature = true): Promise<any> {
    const cleanPhone = fromPhone.replace('+', '');
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BIZ_ACC_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '237657696567',
                  phone_number_id: '10987654321',
                },
                contacts: [{ profile: { name: 'Client Test' }, wa_id: cleanPhone }],
                messages: [
                  {
                    from: cleanPhone,
                    id: `wamid.${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    text: { body: textBody },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const rawBody = JSON.stringify(payload);
    let signatureHeader: string;

    if (validSignature) {
      const hmac = crypto.createHmac('sha256', this.metaAppSecret).update(rawBody).digest('hex');
      signatureHeader = `sha256=${hmac}`;
    } else {
      signatureHeader = `sha256=invalid_forged_signature_00000000000000000000000000000000000000000000000000000000`;
    }

    return this.processIncomingMetaWebhook(rawBody, payload, signatureHeader);
  }

  /**
   * 7. Émission d'une Notification d'Événement de Commande
   */
  async sendOrderEventNotification(
    orderId: string,
    event: 'ORDER_CONFIRMED' | 'DELIVERY_DISPATCHED' | 'DELIVERY_ARRIVED' | 'ORDER_DELIVERED',
    customPhone?: string,
    pinCode?: string
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, store: true },
    });

    const targetPhone = customPhone || order?.customer?.phone || '+237699123456';
    const recipientUser = order?.customer || (await this.prisma.user.findFirst());

    if (!recipientUser) {
      throw new Error('Aucun utilisateur cible disponible pour la notification');
    }

    let title = '';
    let content = '';

    switch (event) {
      case 'ORDER_CONFIRMED':
        title = 'Commande confirmée et réservée';
        content = `✅ PLEINGAZ : Votre commande #${orderId.substring(0, 8)} est confirmée. Réservation garantie 15 minutes. Détails sur votre espace.`;
        break;
      case 'DELIVERY_DISPATCHED':
        title = 'Coursier en route';
        content = `🛵 PLEINGAZ : Votre bouteille est en route vers votre adresse. Le livreur est géolocalisé. Gardez votre téléphone à portée.`;
        break;
      case 'DELIVERY_ARRIVED':
        title = 'Coursier arrivé - Code de remise';
        content = `🚨 PLEINGAZ : Le coursier est arrivé devant votre domicile. Votre code secret de remise physique (D-05) est : ${pinCode || '4829'}. Ne le donnez qu'après inspection de la bouteille.`;
        break;
      case 'ORDER_DELIVERED':
        title = 'Livraison effectuée avec succès';
        content = `🎉 PLEINGAZ : Réception contradictoire validée ! Votre bouteille est installée et votre reçu est disponible en ligne. Merci de votre confiance !`;
        break;
    }

    return this.queueNotification(recipientUser.id, 'WHATSAPP' as NotificationType, title, content, {
      orderId,
      event,
      targetPhone,
      pinCode,
    });
  }

  /**
   * 8. Récupération des logs temps réel
   */
  async getRecentLogs(limit = 20): Promise<{ notifications: any[]; webhooks: MetaWebhookLog[] }> {
    const notifications = await this.prisma.notification.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, phone: true, email: true, whatsappPhone: true } },
      },
    });

    return {
      notifications,
      webhooks: this.recentWebhooks.slice(0, limit),
    };
  }

  /**
   * Méthodes existantes conservées
   */
  async queueNotification(userId: string, type: NotificationType, title: string, content: string, metadata?: any): Promise<any> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        metadata,
      },
    });

    await this.notificationsQueue.add(
      'send-notification',
      { notificationId: notification.id },
      { 
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );

    return notification;
  }

  async getUserNotifications(userId: string): Promise<any> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<any> {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { status: 'SENT' },
    });
  }

  async createReport(userId: string, storeId: string, reason: any, details?: string): Promise<any> {
    return this.prisma.report.create({
      data: {
        userId,
        storeId,
        reason,
        details,
      },
    });
  }

  async getReports(filter?: { storeId?: string; isResolved?: boolean }): Promise<any> {
    return this.prisma.report.findMany({
      where: filter,
      include: {
        user: { select: { id: true, phone: true, email: true } },
        store: { select: { id: true, name: true, city: true, neighborhood: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string, details?: string): Promise<any> {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        isResolved: true,
        details: details ? details : undefined,
      },
    });
  }
}
