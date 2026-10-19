import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * D-06: Génération d'une facture légale immuable pour une commande payée
   */
  async generateInvoice(orderId: string, adminOrSellerId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, invoice: true },
    });

    if (!order) throw new NotFoundException('Commande introuvable.');
    if (order.invoice) throw new BadRequestException('La facture existe déjà pour cette commande (Immuabilité légale).');

    if (order.status === 'CANCELLED' || order.status === 'DRAFT') {
      throw new BadRequestException('Statut de commande non éligible à la facturation.');
    }

    let sellerName = 'PLEINGAZ Cameroun';
    if (order.store) {
      sellerName = `Dépôt PLEINGAZ Agréé : ${order.store.name} (${order.store.city})`;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 7).replace('-', '');
    const invoiceNumber = `INV-${dateStr}-${order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '0001'}`;
    const pdfUrl = `private://invoices/${invoiceNumber}.pdf`;

    const invoice = await this.prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        sellerName,
        totalAmount: order.totalAmount,
        pdfUrl,
      },
    });

    await this.audit.log({
      userId: adminOrSellerId,
      action: 'GENERATE_INVOICE',
      entity: 'Invoice',
      entityId: invoice.id,
      details: { invoiceNumber, totalAmount: order.totalAmount },
    });

    return invoice;
  }

  /**
   * D-06: Émission d'un Avoir légal (Credit Note) en cas d'annulation ou remboursement
   * Ne supprime jamais la facture d'origine mais la marque comme annulée avec pièce comptable justificative.
   */
  async issueCreditNote(invoiceId: string, reason: string, adminId: string): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { creditNotes: true },
    });

    if (!invoice) throw new NotFoundException('Facture introuvable.');
    if (invoice.isVoided) throw new BadRequestException('Cette facture a déjà été annulée par un avoir.');
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Un motif légal d\'avoir est obligatoire.');
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const creditNoteNumber = `AVOIR-${dateStr}-${randomSuffix}`;

    return this.prisma.$transaction(async (tx) => {
      const creditNote = await tx.creditNote.create({
        data: {
          creditNoteNumber,
          invoiceId,
          amount: invoice.totalAmount,
          reason,
          createdById: adminId,
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { isVoided: true },
      });

      await this.audit.log({
        userId: adminId,
        action: 'ISSUE_CREDIT_NOTE',
        entity: 'CreditNote',
        entityId: creditNote.id,
        details: { invoiceNumber: invoice.invoiceNumber, amount: invoice.totalAmount, reason },
      });

      return creditNote;
    });
  }

  /**
   * Consultation d'une facture par ID de commande
   */
  async getInvoiceByOrderId(orderId: string): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: { creditNotes: true, order: true },
    });

    if (!invoice) throw new NotFoundException('Aucune facture trouvée pour cette commande.');
    return invoice;
  }
}
