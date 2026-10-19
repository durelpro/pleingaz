import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DistributorAdminService } from './distributor.admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';
import { ReviewApplicationDto } from './dto/distributor.dto';

@Controller('distributor/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN_SUPPORT, RoleName.SUPER_ADMIN)
export class DistributorAdminController {
  constructor(private readonly adminService: DistributorAdminService) {}

  /**
   * Consultation des dossiers de candidature (pour les agents de support et admins)
   */
  @Get('applications')
  async getApplications(
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.adminService.getApplications({ status, city });
  }

  /**
   * Consultation des pièces et détails d'un dossier KYC
   */
  @Get('applications/:id')
  async getApplication(
    @CurrentUser('id') adminId: string,
    @Param('id') applicationId: string,
  ): Promise<any> {
    return this.adminService.getApplicationById(adminId, applicationId);
  }

  /**
   * Décision administrative sur le dossier KYC (Validation ou Rejet avec motif)
   */
  @Post('applications/:id/review')
  async reviewApplication(
    @CurrentUser('id') adminId: string,
    @Param('id') applicationId: string,
    @Body() dto: ReviewApplicationDto,
  ): Promise<any> {
    return this.adminService.reviewApplication(adminId, applicationId, dto);
  }
}
