import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PayoutService } from './payout.service';
import { LedgerService } from './ledger.service';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';

@Module({
  providers: [
    PaymentsService,
    PayoutService,
    LedgerService,
    MtnMomoProvider,
    OrangeMoneyProvider,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, PayoutService, LedgerService],
})
export class PaymentsModule {}
