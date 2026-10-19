import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req: any): Promise<any> {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string): Promise<any> {
    return this.chatService.getMessages(conversationId);
  }

  @Patch('conversations/:id/read')
  async markRead(@Request() req: any, @Param('id') conversationId: string): Promise<any> {
    return this.chatService.markMessagesAsRead(conversationId, req.user.userId);
  }
}
