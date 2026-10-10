import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Post('messages')
  async sendMessage(@Request() req: any, @Body() body: { recipientId: string; content: string; attachmentUrl?: string }) {
    return this.chatService.saveMessage(req.user.userId, body.recipientId, body.content, body.attachmentUrl);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
