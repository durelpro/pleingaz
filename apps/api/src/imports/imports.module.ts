import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImportDryRunService } from './dry-run.service';
import { ImportApplyService } from './import-apply.service';

@Module({
  imports: [PrismaModule],
  providers: [ImportDryRunService, ImportApplyService],
  exports: [ImportDryRunService, ImportApplyService],
})
export class ImportsModule {}
