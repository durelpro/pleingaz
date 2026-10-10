import { Controller, Get, Put, Post, Body, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('distributor')
@UseGuards(JwtAuthGuard)
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Get('application')
  async getApplication(@Request() req: any) {
    return this.distributorService.getOrCreateDraft(req.user.userId);
  }

  @Put('application/step')
  async updateStep(@Request() req: any, @Body() data: any) {
    return this.distributorService.updateDraft(req.user.userId, data);
  }

  @Post('application/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: any,
    @Body('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.distributorService.uploadDocument(
      req.user.userId,
      type,
      file.buffer,
      file.mimetype,
      file.size,
    );
  }

  @Post('application/submit')
  async submit(@Request() req: any) {
    return this.distributorService.submitApplication(req.user.userId);
  }
}
