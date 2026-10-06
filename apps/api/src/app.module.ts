import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { DistributorModule } from './distributor/distributor.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { SearchModule } from './search/search.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, UsersModule, DistributorModule, CatalogModule, InventoryModule, SearchModule, AlertsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
