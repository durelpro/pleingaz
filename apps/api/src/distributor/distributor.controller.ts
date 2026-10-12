import { 
  Controller, Get, Put, Post, Delete, Body, UseGuards, 
  Request, UploadedFile, UseInterceptors, Param, Res, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('distributor')
@UseGuards(JwtAuthGuard)
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Get('application')
  async getApplication(@Request() req: any) {
    return this.distributorService.getOrCreateDraft(req.user.userId);
  }

  @Get('dashboard-metrics')
  async getDashboardMetrics(@Request() req: any) {
    return this.distributorService.getDashboardMetrics(req.user.userId);
  }

  @Get('my-store')
  async getMyStore(@Request() req: any): Promise<any> {
    return this.distributorService.getMyStore(req.user.userId);
  }

  @Put('my-store/location')
  async updateLocation(@Request() req: any, @Body() data: any): Promise<any> {
    return this.distributorService.updateStoreLocation(req.user.userId, data);
  }

  @Put('application/step')
  async updateStep(@Request() req: any, @Body() data: any) {
    return this.distributorService.updateDraft(req.user.userId, data);
  }

  @Get('documents')
  async getDocuments(@Request() req: any) {
    return this.distributorService.getDocuments(req.user.userId);
  }

  @Post('application/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: any,
    @Body('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.distributorService.uploadDocument(
      req.user.userId,
      type,
      file.buffer,
      file.mimetype,
      file.size,
      file.originalname,
    );
  }

  @Get('documents/:id/file')
  async viewDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const fileInfo = await this.distributorService.getDocumentFile(req.user.userId, id, false);
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.fileName}"`);
    fs.createReadStream(fileInfo.filePath).pipe(res);
  }

  @Delete('documents/:id')
  async deleteDocument(@Request() req: any, @Param('id') id: string) {
    return this.distributorService.deleteDocument(req.user.userId, id);
  }

  @Post('application/submit')
  async submit(@Request() req: any) {
    return this.distributorService.submitApplication(req.user.userId);
  }

  // ==========================================
  // ENDPOINTS FLAGSHIP DÉPÔT CENTRAL
  // ==========================================
  @Get('flagship')
  async getFlagship(): Promise<any> {
    return this.distributorService.getFlagshipDetails();
  }

  @Post('flagship/deliveries/:orderId/status')
  async updateFlagshipDelivery(
    @Param('orderId') orderId: string,
    @Body() body: { status: string; otp?: string },
  ) {
    return this.distributorService.updateDeliveryStatus(orderId, body.status, body.otp);
  }
}

