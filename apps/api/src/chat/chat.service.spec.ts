import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService (Support Tripartite & Confidentialité)', () => {
  let service: ChatService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      chatConversation: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      chatMessage: {
        create: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('saveMessage', () => {
    it('devrait créer la conversation et sauvegarder le message avec masquage partiel du numéro', async () => {
      prisma.chatConversation.upsert.mockResolvedValue({ id: 'conv-123' });
      prisma.chatMessage.create.mockResolvedValue({
        id: 'msg-1',
        conversationId: 'conv-123',
        senderId: 'user-client',
        content: 'Bonjour, où est ma commande ?',
        sender: {
          id: 'user-client',
          name: 'Jean Client',
          phone: '+237699123456',
        },
      });

      const message = await service.saveMessage(
        'user-client',
        'user-courier',
        'Bonjour, où est ma commande ?',
      );

      expect(prisma.chatConversation.upsert).toHaveBeenCalled();
      expect(prisma.chatMessage.create).toHaveBeenCalled();
      // Le numéro doit être masqué pour protéger la vie privée
      expect(message.sender.phone).toBe('+237****56');
    });
  });

  describe('markMessagesAsRead', () => {
    it('devrait marquer comme lus tous les messages reçus de la conversation', async () => {
      prisma.chatMessage.updateMany.mockResolvedValue({ count: 3 });

      const res = await service.markMessagesAsRead('conv-123', 'user-client');

      expect(prisma.chatMessage.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-123',
          senderId: { not: 'user-client' },
          isRead: false,
        },
        data: { isRead: true },
      });
      expect(res.count).toBe(3);
    });
  });
});
