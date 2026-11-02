import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InfoNoticesService, CreateNoticeDto } from './info-notices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('info-notices')
@UseGuards(JwtAuthGuard)
export class InfoNoticesController {
  constructor(private readonly noticesService: InfoNoticesService) {}

  /**
   * Récupération des annonces ciblées pour l'utilisateur connecté (D-18.1)
   */
  @Get('my')
  async getMyNotices(
    @CurrentUser('id') userId: string,
    @Query('role') role?: string,
    @Query('city') city?: string,
  ) {
    return this.noticesService.getNoticesForUser(userId, role, city);
  }

  /**
   * Acquittement formel "J'ai compris" par l'utilisateur
   */
  @Post(':id/ack')
  @HttpCode(HttpStatus.OK)
  async acknowledgeNotice(@Param('id') noticeId: string, @CurrentUser('id') userId: string) {
    return this.noticesService.acknowledgeNotice(noticeId, userId);
  }

  /**
   * Création d'une annonce administrative (Control Center D-18.2)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'COMMUNICATION_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  async createNotice(@CurrentUser('id') creatorId: string, @Body() body: CreateNoticeDto) {
    return this.noticesService.createNotice(creatorId, body);
  }

  /**
   * Liste complète et métriques d'impression pour le Control Center
   */
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAdminNotices() {
    return this.noticesService.getAllNoticesForAdmin();
  }

  /**
   * Activation / Désactivation d'une annonce
   */
  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async toggleNotice(
    @Param('id') noticeId: string,
    @Body('isActive') isActive: boolean,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.noticesService.toggleNotice(noticeId, isActive, operatorId);
  }
}
