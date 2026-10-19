import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('stock-reservations')
export class ReservationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ reservationId?: string; orderId: string }>) {
    const { orderId } = job.data;
    if (!orderId) return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { reservations: true },
    });

    // Si la commande est encore en attente de paiement / validation et que le délai de 15 minutes est écoulé
    if (order && (order.status === 'SUBMITTED' || order.status === 'DRAFT')) {
      await this.prisma.$transaction([
        this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        }),
        this.prisma.stockReservation.updateMany({
          where: { orderId, isConsumed: false },
          data: { isConsumed: true },
        }),
      ]);
      console.log(`[RESERVATION EXPIRED] Commande ${order.orderNumber} annulée suite au délai de 15 minutes.`);
    }
  }
}
