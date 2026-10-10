import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('stock-reservations')
export class ReservationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ reservationId: string; orderId: string }>) {
    console.log(`Traitement de l'expiration de réservation ${job.data.reservationId}`);
    
    const reservation = await this.prisma.stockReservation.findUnique({
      where: { id: job.data.reservationId },
    });

    // Si la réservation n'a pas été consommée (commande non confirmée)
    if (reservation && !reservation.isConsumed) {
      console.log(`La réservation ${job.data.reservationId} a expiré ! Annulation de la commande...`);
      
      await this.prisma.order.update({
        where: { id: job.data.orderId },
        data: { status: 'CANCELLED' },
      });
    }
  }
}
