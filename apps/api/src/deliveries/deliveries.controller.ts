import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';
import {
  RegisterCourierDto,
  UpdateAvailabilityDto,
  CompleteDeliveryDto,
  RemitCashDto,
} from './dto/delivery.dto';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  /**
   * Inscription d'un nouveau livreur tiers PLEINGAZ
   */
  @Post('courier/register')
  async registerCourier(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterCourierDto,
  ): Promise<any> {
    return this.deliveriesService.registerCourier(userId, dto);
  }

  /**
   * Mise à jour de la disponibilité en ligne / hors ligne
   */
  @Put('courier/availability')
  @UseGuards(RolesGuard)
  @Roles(RoleName.COURIER, RoleName.SUPER_ADMIN)
  async updateAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvailabilityDto,
  ): Promise<any> {
    return this.deliveriesService.updateAvailability(userId, dto);
  }

  /**
   * Consultation des livraisons disponibles dans la zone (avec contrôle du plafond de cash)
   */
  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(RoleName.COURIER, RoleName.SUPER_ADMIN)
  async getAvailableDeliveries(@CurrentUser('id') userId: string): Promise<any> {
    return this.deliveriesService.getAvailableDeliveries(userId);
  }

  /**
   * Acceptation d'une livraison
   */
  @Post(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(RoleName.COURIER, RoleName.SUPER_ADMIN)
  async acceptDelivery(
    @CurrentUser('id') userId: string,
    @Param('id') deliveryId: string,
  ): Promise<any> {
    return this.deliveriesService.acceptDelivery(userId, deliveryId);
  }

  /**
   * Confirmation du retrait du colis chez le distributeur
   */
  @Post(':id/pickup')
  @UseGuards(RolesGuard)
  @Roles(RoleName.COURIER, RoleName.SUPER_ADMIN)
  async pickupDelivery(
    @CurrentUser('id') userId: string,
    @Param('id') deliveryId: string,
  ): Promise<any> {
    return this.deliveriesService.pickupDelivery(userId, deliveryId);
  }

  /**
   * Validation de la remise du colis par code secret client SHA-256
   */
  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(RoleName.COURIER, RoleName.SUPER_ADMIN)
  async completeDelivery(
    @CurrentUser('id') userId: string,
    @Param('id') deliveryId: string,
    @Body() dto: CompleteDeliveryDto,
  ): Promise<any> {
    return this.deliveriesService.completeDelivery(userId, deliveryId, dto);
  }

  /**
   * Versement et réconciliation des espèces (déblocage du livreur)
   */
  @Post('courier/:courierId/remit-cash')
  @UseGuards(RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async remitCash(
    @CurrentUser('id') adminOrDistributorId: string,
    @Param('courierId') courierId: string,
    @Body() dto: RemitCashDto,
  ): Promise<any> {
    return this.deliveriesService.remitCash(adminOrDistributorId, courierId, dto);
  }

  /**
   * Enregistrement d'un livreur rattaché par le distributeur
   */
  @Post('distributor/couriers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.SUPER_ADMIN)
  async createDistributorCourier(
    @CurrentUser('id') distributorUserId: string,
    @Body() dto: { name: string; phone: string; vehicleType?: any; areaName?: string },
  ) {
    return this.deliveriesService.createDistributorCourier(distributorUserId, dto);
  }

  /**
   * Consultation des livreurs de la zone d'un distributeur
   */
  @Get('distributor/couriers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.SUPER_ADMIN)
  async getDistributorCouriers(@CurrentUser('id') distributorUserId: string) {
    return this.deliveriesService.getDistributorCouriers(distributorUserId);
  }

  /**
   * Création d'un livreur pour la flotte officielle du Siège (Admin / Control Center)
   */
  @Post('central-fleet/couriers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN_STOCK, RoleName.SUPER_ADMIN)
  async createCentralFleetCourier(
    @CurrentUser('id') adminId: string,
    @Body() dto: { name: string; phone: string; vehicleType?: any; city?: string; areaName?: string },
  ) {
    return this.deliveriesService.createCentralFleetCourier(adminId, dto);
  }

  /**
   * Consultation de la flotte complète des livreurs de l'entreprise
   */
  @Get('central-fleet/couriers')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN_STOCK, RoleName.ADMIN_SUPPORT, RoleName.SUPER_ADMIN)
  async getCentralFleetCouriers() {
    return this.deliveriesService.getCentralFleetCouriers();
  }
}
