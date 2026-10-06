import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
