import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaymentMethod, PaymentStatus } from '@pleingaz/database';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mtnProvider: MtnMomoProvider,
    private readonly orangeProvider: OrangeMoneyProvider,
  ) {}

  /**
   * Tâche 6.2 : Initiation de paiement sécurisée
   */
  async initiatePayment(userId: string, orderId: string, method: PaymentMethod, phone: string): Promise<any> {
    const order = await this.prisma.order.findUnique({ 
      where: { id: orderId },
      include: { store: true, payments: true } 
    });
    if (!order || order.status === 'CANCELLED') throw new BadRequestException('Commande invalide.');

    // Contrôle d'accès : Seul le client de la commande peut initier un paiement
    if (order.customerId !== userId) {
      throw new BadRequestException('Accès refusé à cette commande.');
    }

    // Protection contre le double paiement (Cas d'abus obligatoire)
    const hasSuccessfulPayment = order.payments?.some(p => p.status === 'SUCCESS');
    if (hasSuccessfulPayment) {
      throw new BadRequestException('Cette commande a déjà été réglée avec succès.');
    }

    const idempotencyKey = `PAY-${orderId}-${Date.now()}`; // Prévention des doublons

    if (method === 'CASH') {
      return this.prisma.payment.create({
        data: {
          orderId,
          method,
          status: 'PENDING', // Espèces reste PENDING jusqu'à encaissement physique par livreur
          amount: order.totalAmount,
          idempotencyKey,
        }
      });
    }

    let providerTxId = null;
    let providerStatus = 'PENDING';
    
    // Déterminer le numéro du destinataire (B2C = Distributeur, B2B = Pleingaz)
    let receiverMomo = null;
    let receiverOrange = null;
    
    if (order.type === 'B2B_DISTRIBUTOR') {
      const platformSettings = await this.prisma.platformSettings.findUnique({ where: { id: 'singleton' } });
      receiverMomo = platformSettings?.adminMomoNumber;
      receiverOrange = platformSettings?.adminOrangeNumber;
    } else {
      receiverMomo = order.store?.momoReceiverNumber;
      receiverOrange = order.store?.orangeReceiverNumber;
    }

    if (method === 'MTN_MOMO') {
      if (!receiverMomo) throw new BadRequestException('Le marchand n\'a pas configuré son numéro MTN.');
      const res = await this.mtnProvider.initiatePayment(order.totalAmount, 'XAF', phone, receiverMomo, idempotencyKey);
      providerTxId = res.providerTxId;
      providerStatus = res.status;
    } else if (method === 'ORANGE_MONEY') {
      if (!receiverOrange) throw new BadRequestException('Le marchand n\'a pas configuré son numéro Orange.');
      const res = await this.orangeProvider.initiatePayment(order.totalAmount, 'XAF', phone, receiverOrange, idempotencyKey);
      providerTxId = res.providerTxId;
      providerStatus = res.status;
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method,
        status: providerStatus as PaymentStatus,
        amount: order.totalAmount,
        idempotencyKey,
        providerTxId,
      }
    });

    await this.audit.log({
      userId,
      action: 'INITIATE_PAYMENT',
      entity: 'Payment',
      entityId: payment.id,
      details: { method, providerTxId }
    });

    return payment;
  }

  /**
   * Webhook handler (Tâche 6.2 & 6.3 - Règle R4 Idempotence & Confirmation Serveur)
   */
  async handleWebhook(provider: 'MTN' | 'ORANGE', payload: any, signature: string) {
    // 1. Vérification cryptographique de la signature
    this.verifySignature(provider, payload, signature);

    const providerTxId = payload?.transaction_id || payload?.providerTxId;
    if (!providerTxId) {
      throw new BadRequestException('Identifiant de transaction manquant');
    }

    const newStatus: PaymentStatus = payload.status === 'SUCCESSFUL' || payload.status === 'SUCCESS' 
      ? 'SUCCESS' 
      : 'FAILED';

    const payment = await this.prisma.payment.findUnique({ 
      where: { providerTxId },
      include: { order: true }
    });

    if (!payment) {
      return { ignored: true, reason: 'Transaction inconnue' };
    }

    // Idempotence stricte (Déjà validé avec succès : on ne rejoue rien)
    if (payment.status === 'SUCCESS') {
      return { ok: true, duplicate: true, message: 'Paiement déjà validé' };
    }

    // Mise à jour atomique du paiement et de la commande (Règle R4)
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          lastWebhookData: payload,
        }
      });

      if (newStatus === 'SUCCESS') {
        // Confirmation officielle de la commande sur notification serveur
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: payment.order.status === 'DRAFT' || payment.order.status === 'SUBMITTED' 
              ? 'CONFIRMED' 
              : payment.order.status,
          }
        });
      }
    });

    await this.audit.log({
      userId: 'SYSTEM_WEBHOOK',
      action: 'WEBHOOK_UPDATE',
      entity: 'Payment',
      entityId: payment.id,
      details: { newStatus, providerTxId }
    });

    return { ok: true, status: newStatus };
  }

  private verifySignature(provider: string, payload: any, signature: string) {
    if (!signature) throw new BadRequestException('Signature de webhook manquante');

    const secret = process.env[`${provider}_WEBHOOK_SECRET`];
    if (secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const computed = hmac.update(typeof payload === 'string' ? payload : JSON.stringify(payload)).digest('hex');
      const sigBuf = Buffer.from(signature);
      const compBuf = Buffer.from(computed);
      if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
        throw new BadRequestException('Signature de webhook invalide');
      }
    }
    return true;
  }
}
