import { Controller, Get, Param, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { DistributorAdminService } from './distributor.admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import type { Response } from 'express';
import * as fs from 'fs';

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

  @Get('documents/:docId/file')
  async viewDocument(
    @Request() req: any,
    @Param('docId') docId: string,
    @Res() res: Response,
  ) {
    const fileInfo = await this.adminService.getDocumentFile(req.user.userId, docId);
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.fileName}"`);
    fs.createReadStream(fileInfo.filePath).pipe(res);
  }

  @Post('documents/:docId/validate')
  async validateDocument(
    @Request() req: any,
    @Param('docId') docId: string,
    @Body() body: { isValid: boolean; rejectedReason?: string },
  ) {
    return this.adminService.validateSingleDocument(req.user.userId, docId, body.isValid, body.rejectedReason);
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

