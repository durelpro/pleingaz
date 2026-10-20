import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';
import { DistributorAdminService } from './distributor.admin.service';
import { DistributorAdminController } from './distributor.admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [DistributorService, DistributorAdminService],
  controllers: [DistributorController, DistributorAdminController],
  exports: [DistributorService, DistributorAdminService],
})
export class DistributorModule {}
