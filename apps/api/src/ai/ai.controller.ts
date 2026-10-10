import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService
  ) {}

  @Post('chat')
  async chat(
    @Request() req: any,
    @Body() body: { sessionId: string; message: string }
  ) {
    return this.aiService.chat(req.user.userId, body.sessionId, body.message);
  }

  // Admin Knowledge Base Management
  @Post('knowledge')
  @UseGuards(PermissionsGuard)
  @Permissions('admin:access')
  async addKnowledge(
    @Request() req: any,
    @Body() body: { title: string; content: string }
  ) {
    return this.prisma.knowledgeDocument.create({
      data: {
        title: body.title,
        content: body.content,
        createdBy: req.user.userId,
      }
    });
  }

  // Admin AI Assistant (Tâche 8.6)
  @Post('admin-query')
  @UseGuards(PermissionsGuard)
  @Permissions('admin:access')
  async adminAssistantQuery(
    @Request() req: any,
    @Body() body: { query: string }
  ) {
    return this.aiService.adminAssistantQuery(req.user.userId, body.query);
  }
}
