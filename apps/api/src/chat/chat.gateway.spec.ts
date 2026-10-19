import { ChatGateway } from './chat.gateway';
import * as jwt from 'jsonwebtoken';

describe('ChatGateway (WebSocket Temps Réel)', () => {
  let gateway: ChatGateway;
  let chatServiceMock: any;
  let serverMock: any;

  beforeEach(() => {
    chatServiceMock = {
      saveMessage: jest.fn(),
    };
    serverMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    gateway = new ChatGateway(chatServiceMock);
    gateway.server = serverMock as any;
  });

  describe('handleConnection', () => {
    it('devrait authentifier le client avec token JWT valide et enregistrer son socket', async () => {
      const validToken = jwt.sign({ sub: 'user-client-1' }, 'SUPER_SECRET_KEY_TO_CHANGE_IN_PROD');
      const client = {
        id: 'socket-123',
        handshake: {
          auth: { token: validToken },
          headers: {},
        },
        data: {},
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(client.data.userId).toBe('user-client-1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('devrait déconnecter le socket si aucun token n’est fourni', async () => {
      const client = {
        id: 'socket-456',
        handshake: { auth: {}, headers: {} },
        data: {},
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleMessage', () => {
    it('devrait persister le message et l’émettre au destinataire s’il est connecté', async () => {
      // Connecter d'abord le destinataire
      const destToken = jwt.sign({ sub: 'user-dest-2' }, 'SUPER_SECRET_KEY_TO_CHANGE_IN_PROD');
      const destClient = {
        id: 'socket-dest',
        handshake: { auth: { token: destToken }, headers: {} },
        data: {},
        disconnect: jest.fn(),
      } as any;
      await gateway.handleConnection(destClient);

      // Client expéditeur
      const senderClient = {
        data: { userId: 'user-sender-1' },
      } as any;

      const savedMsg = { id: 'msg-99', content: 'Le livreur est là', senderId: 'user-sender-1' };
      chatServiceMock.saveMessage.mockResolvedValue(savedMsg);

      const res = await gateway.handleMessage(senderClient, {
        recipientId: 'user-dest-2',
        content: 'Le livreur est là',
      });

      expect(chatServiceMock.saveMessage).toHaveBeenCalledWith('user-sender-1', 'user-dest-2', 'Le livreur est là', undefined);
      expect(serverMock.to).toHaveBeenCalledWith('socket-dest');
      expect(serverMock.emit).toHaveBeenCalledWith('newMessage', savedMsg);
      expect(res?.status).toBe('success');
    });
  });
});
