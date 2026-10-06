import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, recipientId: string, content: string, attachmentUrl?: string) {
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
    return this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
        attachmentUrl,
      },
      include: {
        sender: {
          select: { id: true, email: true, phone: true } // Ne pas renvoyer le hash du mot de passe
        }
      }
    });
  }

  async getConversations(userId: string) {
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

  async getMessages(conversationId: string) {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
