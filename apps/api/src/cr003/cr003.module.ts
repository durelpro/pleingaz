import { Module } from '@nestjs/common';
import { Cr003Controller } from './cr003.controller';
import { Cr003Service } from './cr003.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [Cr003Controller],
  providers: [Cr003Service],
  exports: [Cr003Service],
})
export class Cr003Module {}
