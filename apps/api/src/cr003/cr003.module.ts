import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from '../auth/auth.module';

import { CounterSalesService } from './counter-sales.service';
import { CounterSalesController } from './counter-sales.controller';

import { AccountCasesService } from './account-cases.service';
import { AccountCasesController } from './account-cases.controller';

import { InfoNoticesService } from './info-notices.service';
import { InfoNoticesController } from './info-notices.controller';

@Module({
  imports: [PrismaModule, PaymentsModule, AuthModule],
  providers: [CounterSalesService, AccountCasesService, InfoNoticesService],
  controllers: [CounterSalesController, AccountCasesController, InfoNoticesController],
  exports: [CounterSalesService, AccountCasesService, InfoNoticesService],
})
export class Cr003Module {}
