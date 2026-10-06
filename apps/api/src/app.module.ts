import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { DistributorModule } from './distributor/distributor.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, UsersModule, DistributorModule, CatalogModule, InventoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
