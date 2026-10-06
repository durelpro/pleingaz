import { Module } from '@nestjs/common';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';
import { DistributorAdminService } from './distributor.admin.service';
import { DistributorAdminController } from './distributor.admin.controller';

@Module({
  providers: [DistributorService, DistributorAdminService],
  controllers: [DistributorController, DistributorAdminController],
  exports: [DistributorService, DistributorAdminService],
})
export class DistributorModule {}
