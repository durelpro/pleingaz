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
}
