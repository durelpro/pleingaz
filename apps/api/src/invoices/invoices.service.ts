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
      sellerName = `Distributeur agréé : ${order.store.name}`;
    }

    // Génération du numéro de facture (Règle métier)
    const invoiceNumber = `INV-${Date.now()}-${order.orderNumber.substring(order.orderNumber.length - 4)}`;

    // TODO: Générer le PDF ici avec une librairie (ex: pdfkit) et uploader sur GCS/S3
    const pdfUrl = `private://invoices/${invoiceNumber}.pdf`;

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

  /**
   * Récupérer les détails d'une facture officielle avec toutes ses données fiscales et légales
   */
  async getInvoiceByOrderId(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: true,
        items: { include: { product: true } },
        store: true,
        customer: { include: { customerProfile: true } },
        delivery: true,
        payments: true,
      }
    });

    if (!order) throw new BadRequestException('Commande introuvable.');
    if (!order.invoice) throw new BadRequestException('Facture non encore émise pour cette commande.');

    return {
      invoice: order.invoice,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      type: order.type,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      customer: {
        id: order.customer.id,
        phone: order.customer.phone,
        name: order.customer.customerProfile 
          ? `${order.customer.customerProfile.firstName || ''} ${order.customer.customerProfile.lastName || ''}`.trim()
          : `Client (${order.customer.phone?.slice(-4) || 'Vérifié'})`
      },
      seller: {
        name: order.store ? order.store.name : 'PLEINGAZ / INFOTECH S.A.',
        city: order.store?.city || 'Douala',
        neighborhood: order.store?.neighborhood || 'Akwa',
        landmark: order.store?.landmark || null,
        phone: order.store?.whatsappNumber || '+237 657 696 567',
      },
      items: order.items.map(it => ({
        id: it.id,
        brand: it.product?.brand || 'PLEINGAZ',
        weight: it.product?.weightKg ? `${it.product.weightKg}kg` : '12.5kg',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      companyDetails: {
        companyName: 'INFOTECH S.A. / PLEINGAZ',
        rccm: 'RC/DLA/2018/B/4521',
        niu: 'M051812739210N',
        headquarters: 'Douala, Cameroun - Rue De La Joie, Akwa',
        supportPhone: '+237 657 696 567',
        supportEmail: 'support@monpleingaz.com',
        website: 'https://www.monpleingaz.com',
      }
    };
  }
}
