import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, recipientId: string, content: string, attachmentUrl?: string): Promise<any> {
    // Si recipientId est l'ID d'une boutique au lieu d'un User, mapper vers store.ownerId
    let finalRecipientId = recipientId;
    const store = await this.prisma.store.findUnique({ 
      where: { id: recipientId }, 
      select: { ownerId: true } 
    });
    if (store && store.ownerId) {
      finalRecipientId = store.ownerId;
    }

    // Ordre des participants pour l'unicité de la conversation
    const [p1, p2] = [senderId, finalRecipientId].sort();

    // Upsert la conversation
    const conversation = await this.prisma.chatConversation.upsert({
      where: {
        participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 }
      },
      create: {
        participant1Id: p1,
        participant2Id: p2
      },
      update: {
        updatedAt: new Date()
      }
    });

    // Enregistrer le message
    return this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
        attachmentUrl,
      },
      include: {
        sender: {
          select: { 
            id: true, 
            email: true, 
            phone: true,
            customerProfile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernier message pour l'aperçu
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const enriched = await Promise.all(conversations.map(async (conv) => {
      const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      
      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherId },
        select: {
          id: true,
          phone: true,
          email: true,
          customerProfile: { select: { firstName: true, lastName: true } },
          stores: { select: { id: true, name: true, city: true, neighborhood: true, landmark: true } }
        }
      });

      let storeInfo = otherUser?.stores?.[0] || null;
      if (!storeInfo) {
        const directStore = await this.prisma.store.findUnique({
          where: { id: otherId },
          select: { id: true, name: true, city: true, neighborhood: true, landmark: true, ownerId: true }
        });
        if (directStore) {
          storeInfo = directStore;
        }
      }

      const clientName = otherUser?.customerProfile 
        ? `${otherUser.customerProfile.firstName} ${otherUser.customerProfile.lastName}`.trim() 
        : null;

      return {
        ...conv,
        otherParticipant: {
          id: otherId,
          phone: otherUser?.phone || null,
          name: storeInfo?.name || clientName || otherUser?.phone || 'Correspondant',
          store: storeInfo,
          isStore: !!storeInfo,
        }
      };
    }));

    return enriched;
  }

  async getMessages(conversationId: string): Promise<any[]> {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            phone: true,
            customerProfile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  /**
   * Recherche dynamique de correspondants :
   * - Boutiques / Distributeurs agréés (visibles pour tous les utilisateurs)
   * - Clients (recherche par les distributeurs)
   * - Support officiel PLEINGAZ
   */
  async searchContacts(userId: string, query?: string): Promise<any[]> {
    const q = (query || '').trim();

    // 1. Déterminer le rôle de l'utilisateur demandeur
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } }, stores: true },
    });

    const isDistributorOrAdmin = currentUser?.roles.some(
      r => r.role.name === 'DISTRIBUTOR' || r.role.name === 'ADMIN'
    );

    const results: any[] = [];

    // 2. Boutiques agréées (recherche par nom, ville, quartier, repère)
    const storeWhere: any = {
      isVisible: true,
    };
    if (q) {
      storeWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { neighborhood: { contains: q, mode: 'insensitive' } },
        { landmark: { contains: q, mode: 'insensitive' } },
      ];
    }

    const stores = await this.prisma.store.findMany({
      where: storeWhere,
      select: {
        id: true,
        name: true,
        city: true,
        neighborhood: true,
        landmark: true,
        ownerId: true,
        isVerifiedBadge: true,
        reliabilityScore: true,
      },
      take: 20,
    });

    for (const store of stores) {
      // Éviter de s'afficher soi-même si distributeur
      if (store.ownerId === userId) continue;

      results.push({
        id: store.ownerId || store.id,
        storeId: store.id,
        name: store.name,
        type: 'STORE',
        subtitle: `${store.city} - ${store.neighborhood}${store.landmark ? ` (${store.landmark})` : ''}`,
        isVerified: store.isVerifiedBadge,
        score: store.reliabilityScore || 90,
      });
    }

    // 3. Si l'utilisateur est distributeur ou admin, il peut aussi chercher des clients
    if (isDistributorOrAdmin && q.length >= 2) {
      const customers = await this.prisma.user.findMany({
        where: {
          id: { not: userId },
          OR: [
            { phone: { contains: q } },
            { customerProfile: { firstName: { contains: q, mode: 'insensitive' } } },
            { customerProfile: { lastName: { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          phone: true,
          customerProfile: { select: { firstName: true, lastName: true } },
        },
        take: 10,
      });

      for (const cust of customers) {
        const fullName = cust.customerProfile 
          ? `${cust.customerProfile.firstName} ${cust.customerProfile.lastName}`.trim()
          : null;
        results.push({
          id: cust.id,
          name: fullName || `Client (${cust.phone})`,
          type: 'CUSTOMER',
          subtitle: `Client PLEINGAZ - ${cust.phone}`,
        });
      }
    }

    // 4. Contact Assistance PLEINGAZ (toujours disponible si non admin)
    const adminUser = await this.prisma.userRole.findFirst({
      where: { role: { name: 'ADMIN' } },
      include: { user: true },
    });

    if (adminUser && adminUser.userId !== userId && (!q || 'support assistance pleingaz'.includes(q.toLowerCase()))) {
      results.unshift({
        id: adminUser.userId,
        name: 'Assistance Officielle PLEINGAZ',
        type: 'SUPPORT',
        subtitle: 'Support client & urgences de livraison',
        isVerified: true,
      });
    }

    return results;
  }
}
