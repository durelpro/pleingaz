import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplyDistributorDto } from './dto/distributor.dto';

@Controller('distributor')
@UseGuards(JwtAuthGuard)
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  /**
   * Consultation du statut de sa candidature
   */
  @Get('application/status')
  async getStatus(@CurrentUser('id') userId: string) {
    return this.distributorService.getMyApplication(userId);
  }

  /**
   * D-04: Renseignement ou mise à jour des coordonnées de la boutique
   */
  @Post('apply')
  async apply(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyDistributorDto,
  ) {
    return this.distributorService.applyOrUpdate(userId, dto);
  }

  /**
   * D-04: Upload d'un document KYC (CNI recto/verso, portrait, boutique)
   */
  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser('id') userId: string,
    @Body('type') type: string,
    @UploadedFile() file?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier transmis.');
    }
    if (!type) {
      throw new BadRequestException('Le type de document est obligatoire.');
    }

    return this.distributorService.uploadDocument(
      userId,
      type,
      file.buffer,
      file.mimetype,
      file.size,
    );
  }

  /**
   * D-04: Soumission finale pour examen par les administrateurs
   */
  @Post('application/submit')
  async submit(@CurrentUser('id') userId: string) {
    return this.distributorService.submitApplication(userId);
  }
}
