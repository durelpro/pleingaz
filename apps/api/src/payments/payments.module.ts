import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';

@Module({
  providers: [PaymentsService, MtnMomoProvider, OrangeMoneyProvider],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
