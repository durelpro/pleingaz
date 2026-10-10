import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Tâche 4.7 : S'abonner à une alerte ("Alertez-moi quand le gaz revient")
   */
  async subscribeToRestockAlert(userId: string, productId: string, latitude?: number, longitude?: number, storeId?: string) {
    // Règle 4.7 : Anti-spam (limiter à 1 alerte non résolue par produit par utilisateur)
    const existing = await this.prisma.demandAlert.findFirst({
      where: {
        userId,
        productId,
        isFulfilled: false,
      },
    });

    if (existing) {
      throw new BadRequestException('Vous avez déjà une alerte en attente pour ce produit.');
    }

    const alert = await this.prisma.demandAlert.create({
      data: {
        userId,
        productId,
        latitude,
        longitude,
        storeId,
      },
    });

    await this.audit.log({
      userId,
      action: 'CREATE_ALERT',
      entity: 'DemandAlert',
      entityId: alert.id,
      details: { productId, storeId },
    });

    return alert;
  }
}
