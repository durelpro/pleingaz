import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DistributorAdminService } from './distributor.admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('admin/distributors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('applications:manage')
export class DistributorAdminController {
  constructor(private readonly adminService: DistributorAdminService) {}

  @Get('pending')
  async getPending() {
    return this.adminService.getPendingApplications();
  }

  @Get(':id/documents')
  async getDocuments(@Request() req: any, @Param('id') id: string) {
    return this.adminService.getApplicationDocuments(req.user.userId, id);
  }

  @Post(':id/approve')
  async approve(@Request() req: any, @Param('id') id: string) {
    return this.adminService.approveApplication(req.user.userId, id);
  }

  @Post(':id/reject')
  async reject(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectApplication(req.user.userId, id, reason);
  }
}
