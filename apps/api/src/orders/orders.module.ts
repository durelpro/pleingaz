import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ReservationProcessor } from './reservation.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'stock-reservations',
    }),
  ],
  providers: [OrdersService, ReservationProcessor],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
