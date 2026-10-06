import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
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
}
