import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, recipientId: string, content: string, attachmentUrl?: string): Promise<any> {
    // Ordre des participants pour l'unicité de la conversation
    const [p1, p2] = [senderId, recipientId].sort();

    // Upsert la conversation
    const conversation = await this.prisma.chatConversation.upsert({
      where: {
        participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 }
      },
      create: {
        participant1Id: p1,
        participant2Id: p2
      },
      update: {}
    });

    // Enregistrer le message
    const message = (await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
        attachmentUrl,
      },
      include: {
        sender: {
          select: { id: true, phone: true, email: true }
        }
      }
    })) as any;

    // Masquage partiel du numéro de téléphone pour la confidentialité (ex: +237 6*****67)
    if (message.sender && message.sender.phone) {
      const p = message.sender.phone;
      if (p.length > 6) {
        message.sender.phone = `${p.slice(0, 4)}****${p.slice(-2)}`;
      }
    }

    return message;
  }

  async getConversations(userId: string): Promise<any> {
    return this.prisma.chatConversation.findMany({
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
      }
    });
  }

  async getMessages(conversationId: string): Promise<any> {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markMessagesAsRead(conversationId: string, currentUserId: string): Promise<any> {
    return this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
