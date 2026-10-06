import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to store userId -> socketId
  private activeUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'SUPER_SECRET_KEY_TO_CHANGE_IN_PROD') as any;
      const userId = payload.sub;
      
      this.activeUsers.set(userId, client.id);
      client.data.userId = userId;
      
      console.log(\`[ChatGateway] User connected: \${userId}\`);
    } catch (e) {
      console.error('[ChatGateway] Invalid token', e.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.activeUsers.delete(client.data.userId);
      console.log(\`[ChatGateway] User disconnected: \${client.data.userId}\`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { recipientId: string; content: string; attachmentUrl?: string }
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    // Save message to DB
    const message = await this.chatService.saveMessage(senderId, payload.recipientId, payload.content, payload.attachmentUrl);

    // Send to recipient if online
    const recipientSocketId = this.activeUsers.get(payload.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('newMessage', message);
    }
    
    // Ack back to sender
    return { status: 'success', message };
  }
}
