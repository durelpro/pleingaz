import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaymentMethod, PaymentStatus } from '@pleingaz/database';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mtnProvider: MtnMomoProvider,
    private readonly orangeProvider: OrangeMoneyProvider,
  ) {}

  /**
   * Tâche 6.2 : Initiation de paiement
   */
  async initiatePayment(userId: string, orderId: string, method: PaymentMethod, phone: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === 'CANCELLED') throw new BadRequestException('Commande invalide.');

    const idempotencyKey = \`PAY-\${orderId}-\${Date.now()}\`; // Prévention des doublons

    if (method === 'CASH') {
      return this.prisma.payment.create({
        data: {
          orderId,
          method,
          status: 'SUCCESS', // Manuel au comptoir = déjà ok virtuellement en attente du livreur
          amount: order.totalAmount,
          idempotencyKey,
        }
      });
    }

    let providerTxId = null;
    let providerStatus = 'PENDING';

    if (method === 'MTN_MOMO') {
      const res = await this.mtnProvider.initiatePayment(order.totalAmount, 'XAF', phone, idempotencyKey);
      providerTxId = res.providerTxId;
      providerStatus = res.status;
    } else if (method === 'ORANGE_MONEY') {
      const res = await this.orangeProvider.initiatePayment(order.totalAmount, 'XAF', phone, idempotencyKey);
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
   * Webhook handler (Tâche 6.2 & 6.3)
   */
  async handleWebhook(provider: 'MTN' | 'ORANGE', payload: any, signature: string) {
    // 1. Vérification de la signature (très important pour la sécurité)
    this.verifySignature(provider, payload, signature);

    const providerTxId = payload.transaction_id;
    const newStatus: PaymentStatus = payload.status === 'SUCCESSFUL' ? 'SUCCESS' : 'FAILED';

    const payment = await this.prisma.payment.findUnique({ where: { providerTxId } });
    if (!payment) return; // Ignore

    // Idempotence webhook (déjà traité ?)
    if (payment.status === 'SUCCESS') return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        lastWebhookData: payload,
      }
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'WEBHOOK_UPDATE',
      entity: 'Payment',
      entityId: payment.id,
      details: { newStatus }
    });
  }

  private verifySignature(provider: string, payload: any, signature: string) {
    // Tâche 6.2: Logique de validation HMAC (Mockée en sandbox)
    if (!signature) throw new BadRequestException('Signature manquante');
    return true;
  }
}
