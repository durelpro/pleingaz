import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: CreateAuditLogDto) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // We don't want audit log failure to crash the main transaction
      this.logger.error(`Failed to save audit log: ${error.message}`, error.stack);
    }
  }
}
