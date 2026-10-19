import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplyDistributorDto } from './dto/distributor.dto';

@Controller('distributor')
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  /**
   * D-04: Candidature publique directe avec upload simultané des 3 pièces justificatives KYC
   */
  @Post('public-apply')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idCardFront', maxCount: 1 },
      { name: 'idCardBack', maxCount: 1 },
      { name: 'portraitPhoto', maxCount: 1 },
      { name: 'shopPhoto', maxCount: 1 },
    ]),
  )
  async publicApply(
    @Body() body: any,
    @UploadedFiles()
    files: {
      idCardFront?: Express.Multer.File[];
      idCardBack?: Express.Multer.File[];
      portraitPhoto?: Express.Multer.File[];
      shopPhoto?: Express.Multer.File[];
    },
  ) {
    return this.distributorService.submitPublicApplication(body, files || {});
  }

  /**
   * Consultation du statut de sa candidature
   */
  @Get('application/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser('id') userId: string) {
    return this.distributorService.getMyApplication(userId);
  }

  /**
   * D-04: Renseignement ou mise à jour des coordonnées de la boutique
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard)
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
