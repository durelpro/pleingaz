import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Générer une facture immuable pour une commande
   */
  async generateInvoice(orderId: string, adminOrSellerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, invoice: true }
    });

    if (!order) throw new BadRequestException('Commande introuvable.');
    if (order.invoice) throw new BadRequestException('La facture existe déjà pour cette commande (Immuable).');
    
    // On ne facture que les commandes CONFIRMED ou plus
    if (order.status === 'DRAFT' || order.status === 'CANCELLED') {
      throw new BadRequestException('Statut de commande invalide pour la facturation.');
    }

    // Nom du vendeur selon le type
    let sellerName = 'PLEINGAZ - Vente directe';
    if (order.store) {
      sellerName = \`Distributeur agréé : \${order.store.name}\`;
    }

    // Génération du numéro de facture (Règle métier)
    const invoiceNumber = \`INV-\${Date.now()}-\${order.orderNumber.substring(order.orderNumber.length - 4)}\`;

    // TODO: Générer le PDF ici avec une librairie (ex: pdfkit) et uploader sur GCS/S3
    const pdfUrl = \`private://invoices/\${invoiceNumber}.pdf\`;

    const invoice = await this.prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        sellerName,
        totalAmount: order.totalAmount,
        pdfUrl,
      }
    });

    await this.audit.log({
      userId: adminOrSellerId,
      action: 'GENERATE_INVOICE',
      entity: 'Invoice',
      entityId: invoice.id,
    });

    return invoice;
  }
}
