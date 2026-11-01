import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  Query, 
  Headers, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  Req
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportReason } from '@pleingaz/database';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 1. Meta Webhook Handshake GET
   * Requis par Meta lors de l'enregistrement de l'URL du webhook.
   */
  @Get('whatsapp/webhook')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    return this.notificationsService.verifyMetaWebhookChallenge(mode, token, challenge);
  }

  /**
   * 2. Meta Webhook POST - Réception sécurisée (D-12, Menace M24)
   * Valide cryptographiquement la signature HMAC SHA-256 dans l'en-tête 'x-hub-signature-256'
   */
  @Post('whatsapp/webhook')
  @HttpCode(HttpStatus.OK)
  async handleMetaWebhook(
    @Body() payload: any,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: any,
  ): Promise<any> {
    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(payload);
    return this.notificationsService.processIncomingMetaWebhook(rawBody, payload, signature);
  }

  /**
   * 3. Création d'un Défi WhatsApp entrant (D-12)
   */
  @Post('whatsapp/challenge')
  @HttpCode(HttpStatus.CREATED)
  async createChallenge(
    @Body() body: { phone: string; purpose?: string }
  ): Promise<any> {
    return this.notificationsService.createWhatsAppChallenge(body.phone, body.purpose);
  }

  /**
   * 4. Vérification d'état d'un Défi WhatsApp (Polling ou SSE)
   */
  @Get('whatsapp/challenge/:phone')
  async checkChallenge(
    @Param('phone') phone: string
  ): Promise<any> {
    return this.notificationsService.checkWhatsAppChallenge(phone);
  }

  /**
   * 5. Simulateur d'événement Webhook Meta entrant
   */
  @Post('whatsapp/simulate-incoming')
  @HttpCode(HttpStatus.OK)
  async simulateIncomingWebhook(
    @Body() body: { fromPhone: string; textBody: string; validSignature?: boolean }
  ): Promise<any> {
    const valid = body.validSignature !== undefined ? body.validSignature : true;
    return this.notificationsService.simulateIncomingWebhookMessage(body.fromPhone, body.textBody, valid);
  }

  /**
   * 6. Émission d'une Notification de cycle de commande
   */
  @Post('order-event')
  @HttpCode(HttpStatus.OK)
  async sendOrderEvent(
    @Body() body: {
      orderId: string;
      event: 'ORDER_CONFIRMED' | 'DELIVERY_DISPATCHED' | 'DELIVERY_ARRIVED' | 'ORDER_DELIVERED';
      customPhone?: string;
      pinCode?: string;
    }
  ): Promise<any> {
    return this.notificationsService.sendOrderEventNotification(
      body.orderId,
      body.event,
      body.customPhone,
      body.pinCode
    );
  }

  /**
   * 7. Journal temps réel des notifications et webhooks
   */
  @Get('logs')
  async getLogs(
    @Query('limit') limit?: string
  ): Promise<any> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getRecentLogs(limitNum);
  }

  // ==========================================
  // ROUTES AUTHENTIFIÉES (Utilisateur connecté)
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(@Request() req: any): Promise<any> {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Request() req: any,
    @Body() body: { storeId: string; reason: ReportReason; details?: string }
  ): Promise<any> {
    return this.notificationsService.createReport(req.user.userId, body.storeId, body.reason, body.details);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT')
  async getReports(
    @Query('storeId') storeId?: string,
    @Query('isResolved') isResolved?: string,
  ): Promise<any> {
    const resolvedBool = isResolved !== undefined ? isResolved === 'true' : undefined;
    return this.notificationsService.getReports({ storeId, isResolved: resolvedBool });
  }

  @Patch('reports/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT')
  async resolveReport(
    @Param('id') id: string,
    @Body() body: { details?: string },
  ): Promise<any> {
    return this.notificationsService.resolveReport(id, body.details);
  }
}
