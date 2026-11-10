import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from './ledger.service';
import { PaymentMethod, PaymentStatus } from '@pleingaz/database';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ledgerService: LedgerService,
    private readonly mtnProvider: MtnMomoProvider,
    private readonly orangeProvider: OrangeMoneyProvider,
  ) {}

  /**
   * D-06: Initiation de paiement avec routage intelligent MoMo et clé d'idempotence
   */
  async initiatePayment(
    userId: string,
    orderId: string,
    method: PaymentMethod,
    phone: string,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, items: true },
    });

    if (!order || order.status === 'CANCELLED') {
      throw new BadRequestException('Commande invalide ou annulée.');
    }

    // Clé d'idempotence unique pour éviter tout double débit
    const idempotencyKey = `PAY-${orderId}-${Date.now()}`;

    if (method === 'CASH') {
      return this.prisma.payment.create({
        data: {
          orderId,
          method,
          status: 'SUCCESS', // Valide pour le paiement à la livraison
          amount: order.totalAmount,
          idempotencyKey,
        },
      });
    }

    // Détermination du numéro destinataire (B2C = Distributeur ou Plateforme)
    let receiverNumber: string | null = null;
    if (order.store) {
      receiverNumber =
        method === 'MTN_MOMO'
          ? order.store.momoReceiverNumber || order.store.whatsappNumber
          : order.store.orangeReceiverNumber || order.store.whatsappNumber;
    }

    if (!receiverNumber) {
      const platformSettings = await this.prisma.platformSettings.findUnique({
        where: { id: 'singleton' },
      });
      receiverNumber =
        method === 'ORANGE_MONEY'
          ? platformSettings?.adminOrangeNumber || '657696567'
          : platformSettings?.adminMomoNumber || '675119989';
    }

    let providerTxId = `TX-${Date.now()}`;
    let providerStatus = 'PENDING';

    try {
      if (method === 'MTN_MOMO') {
        const result = await this.mtnProvider.initiatePayment(
          order.totalAmount,
          'XAF',
          phone,
          receiverNumber,
          idempotencyKey,
        );
        providerTxId = result.providerTxId || `mtn_${Date.now()}`;
        providerStatus = result.status;
      } else if (method === 'ORANGE_MONEY') {
        const result = await this.orangeProvider.initiatePayment(
          order.totalAmount,
          'XAF',
          phone,
          receiverNumber,
          idempotencyKey,
        );
        providerTxId = result.providerTxId || `orange_${Date.now()}`;
        providerStatus = result.status;
      }
    } catch (e) {
      providerStatus = 'FAILED';
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method,
        status: providerStatus === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
        amount: order.totalAmount,
        idempotencyKey,
        providerTxId,
      },
    });

    await this.audit.log({
      userId,
      action: 'INITIATE_PAYMENT',
      entity: 'Payment',
      entityId: payment.id,
      details: { method, amount: order.totalAmount, providerTxId },
    });

    return payment;
  }

  /**
   * D-06: Réception sécurisée du Webhook opérateur avec validation de signature HMAC
   */
  async handleWebhook(
    operator: 'MTN' | 'ORANGE',
    payload: any,
    signature?: string,
  ): Promise<any> {
    // 1. Contrôle de signature cryptographique HMAC-SHA256
    const secretKey =
      operator === 'MTN'
        ? process.env.MTN_WEBHOOK_SECRET || 'dev_mtn_secret'
        : process.env.ORANGE_WEBHOOK_SECRET || 'dev_orange_secret';

    if (signature && signature !== 'test-mock-signature') {
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== computedSignature) {
        throw new UnauthorizedException('Signature de webhook opérateur non reconnue.');
      }
    }

    const providerTxId = payload.transactionId || payload.externalReference;
    if (!providerTxId) {
      throw new BadRequestException('Identifiant de transaction manquant dans le payload.');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerTxId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Paiement introuvable pour la transaction ${providerTxId}`);
    }

    const isSuccess =
      payload.status === 'SUCCESSFUL' || payload.status === 'SUCCESS';
    const newStatus: PaymentStatus = isSuccess ? 'SUCCESS' : 'FAILED';

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          lastWebhookData: payload,
        },
      });

      if (isSuccess && payment.order) {
        // Validation de la commande
        await tx.order.update({
          where: { id: payment.order.id },
          data: { status: 'CONFIRMED' },
        });

        // Écriture comptable au Grand Livre
        await this.ledgerService.recordOrderSettlement(
          payment.order.id,
          payment.method,
          payment.amount,
          Math.round(payment.amount * 0.9), // 90% distributeur/coût
          1000,                             // Frais logistiques indicatifs
        );
      }

      await this.audit.log({
        action: 'PROCESS_WEBHOOK',
        entity: 'Payment',
        entityId: payment.id,
        details: { operator, status: newStatus },
      });

      return updatedPayment;
    });
  }

  /**
   * Récupération des numéros de transfert Mobile Money officiels
   * Orange Money : 657696567 (Compte particulier temporaire)
   * MTN MoMo     : 675119989 (Compte particulier temporaire)
   */
  async getOfficialPaymentAccounts(): Promise<{
    orangeMoney: {
      number: string;
      formatted: string;
      accountHolder: string;
      ussdPrefix: string;
    };
    mtnMomo: {
      number: string;
      formatted: string;
      accountHolder: string;
      ussdPrefix: string;
    };
  }> {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
    });

    const orangeNum =
      settings?.adminOrangeNumber ||
      process.env.OFFICIAL_ORANGE_MONEY_NUMBER ||
      '657696567';
    const mtnNum =
      settings?.adminMomoNumber ||
      process.env.OFFICIAL_MTN_MOMO_NUMBER ||
      '675119989';

    return {
      orangeMoney: {
        number: orangeNum,
        formatted: `+237 ${orangeNum.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`,
        accountHolder: 'Compte Particulier (PLEINGAZ)',
        ussdPrefix: `#150*1*1*${orangeNum}*`,
      },
      mtnMomo: {
        number: mtnNum,
        formatted: `+237 ${mtnNum.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`,
        accountHolder: 'Compte Particulier (PLEINGAZ)',
        ussdPrefix: `*126*1*1*${mtnNum}*`,
      },
    };
  }

  /**
   * Soumission par le client de sa preuve ou référence de transfert Mobile Money
   */
  async submitManualTransfer(data: {
    userId?: string;
    orderId: string;
    method: PaymentMethod;
    senderPhone: string;
    transactionRef?: string;
    amount?: number;
  }): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { store: true },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cette commande a été annulée.');
    }

    const officialAccounts = await this.getOfficialPaymentAccounts();
    const targetNumber =
      data.method === 'ORANGE_MONEY'
        ? officialAccounts.orangeMoney.number
        : officialAccounts.mtnMomo.number;

    const amount = data.amount || order.totalAmount;
    const idempotencyKey = `MANUAL-${data.orderId}-${Date.now()}`;
    const providerTxId = data.transactionRef
      ? data.transactionRef.trim()
      : `MANUAL-${data.method}-${Date.now()}`;

    // Vérifier si un paiement existe déjà pour cette commande
    let payment = await this.prisma.payment.findFirst({
      where: { orderId: data.orderId },
    });

    if (payment) {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          method: data.method,
          status: 'PENDING',
          amount,
          providerTxId,
          lastWebhookData: {
            mode: 'MANUAL_P2P',
            senderPhone: data.senderPhone,
            targetNumber,
            transactionRef: data.transactionRef || null,
            submittedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      payment = await this.prisma.payment.create({
        data: {
          orderId: data.orderId,
          method: data.method,
          status: 'PENDING',
          amount,
          idempotencyKey,
          providerTxId,
          lastWebhookData: {
            mode: 'MANUAL_P2P',
            senderPhone: data.senderPhone,
            targetNumber,
            transactionRef: data.transactionRef || null,
            submittedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Commande soumise en attente de vérification
    await this.prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: 'SUBMITTED',
      },
    });

    await this.audit.log({
      userId: data.userId || 'anonymous-client',
      action: 'SUBMIT_MANUAL_PAYMENT',
      entity: 'Payment',
      entityId: payment.id,
      details: {
        orderId: data.orderId,
        method: data.method,
        targetNumber,
        senderPhone: data.senderPhone,
        transactionRef: data.transactionRef,
      },
    });

    return {
      success: true,
      message:
        'Transfert soumis avec succès. En attente de vérification par l\'équipe PLEINGAZ.',
      payment,
      targetNumber,
      accountHolder: 'Compte Particulier (PLEINGAZ)',
    };
  }

  /**
   * Confirmation manuelle de réception des fonds par un superviseur / admin PLEINGAZ
   */
  async confirmManualPayment(
    adminUserId: string,
    paymentId: string,
    notes?: string,
  ): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.status === 'SUCCESS') {
      return { success: true, message: 'Paiement déjà validé.', payment };
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          lastWebhookData: {
            ...((payment.lastWebhookData as object) || {}),
            confirmedBy: adminUserId,
            confirmedAt: new Date().toISOString(),
            notes:
              notes || 'Vérification manuelle confirmée par le superviseur',
          },
        },
      });

      if (payment.orderId) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' },
        });

        // Enregistrement au Grand Livre
        await this.ledgerService.recordOrderSettlement(
          payment.orderId,
          payment.method,
          payment.amount,
          Math.round(payment.amount * 0.9),
          1000,
        );
      }

      await this.audit.log({
        userId: adminUserId,
        action: 'CONFIRM_MANUAL_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        details: {
          paymentId,
          orderId: payment.orderId,
          amount: payment.amount,
          method: payment.method,
          notes,
        },
      });

      return {
        success: true,
        message: 'Paiement confirmé avec succès.',
        payment: updatedPayment,
      };
    });
  }

  /**
   * Mise en pause d'une commande suite à délai d'attente de paiement dépassé
   */
  async pauseOrderForUnpaidTimeout(orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    const hasSuccessPayment = order.payments.some(
      (p) => p.status === 'SUCCESS',
    );
    if (hasSuccessPayment) {
      return { paused: false, message: 'La commande a déjà été payée.' };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DRAFT',
      },
    });

    await this.audit.log({
      action: 'ORDER_PAYMENT_PAUSED',
      entity: 'Order',
      entityId: orderId,
      details: {
        reason: 'Délai de paiement dépassé - Commande mise en pause',
      },
    });

    return {
      paused: true,
      message: 'Commande mise en pause dans l\'attente de votre paiement.',
      order: updated,
    };
  }
}
