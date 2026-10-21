import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImportDryRunService } from './dry-run.service';
import { ImportApplyService } from './import-apply.service';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClaimsController],
  providers: [ImportDryRunService, ImportApplyService, ClaimsService],
  exports: [ImportDryRunService, ImportApplyService, ClaimsService],
})
export class ImportsModule {}

