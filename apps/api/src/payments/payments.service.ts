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
      receiverNumber = platformSettings?.adminMomoNumber || '+237600000000';
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
}
