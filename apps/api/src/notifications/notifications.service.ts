import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from '@pleingaz/database';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  /**
   * Tâche 7.1 : Centre de notifications via BullMQ
   */
  async queueNotification(userId: string, type: NotificationType, title: string, content: string, metadata?: any): Promise<any> {
    // 1. Enregistrement en base de données avec le statut PENDING
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        metadata,
      }
    });

    // 2. Ajout dans la file d'attente BullMQ pour traitement asynchrone (reprises auto)
    await this.notificationsQueue.add(
      'send-notification',
      { notificationId: notification.id },
      { 
        attempts: 3, // Reprises automatiques en cas d'échec
        backoff: { type: 'exponential', delay: 5000 }
      }
    );

    return notification;
  }

  async getUserNotifications(userId: string): Promise<any> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<any> {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { status: 'SENT' }, // Ou statut lu selon l'enum
    });
  }

  /**
   * Tâche 7.5 : Signalements (Boutique fermée, mauvais numéro, etc.)
   */
  async createReport(userId: string, storeId: string, reason: any, details?: string): Promise<any> {
    return this.prisma.report.create({
      data: {
        userId,
        storeId,
        reason,
        details,
      }
    });
  }

  async getReports(filter?: { storeId?: string; isResolved?: boolean }): Promise<any> {
    return this.prisma.report.findMany({
      where: filter,
      include: {
        user: { select: { id: true, phone: true, email: true } },
        store: { select: { id: true, name: true, city: true, neighborhood: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string, details?: string): Promise<any> {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        isResolved: true,
        details: details ? details : undefined,
      },
    });
  }
}
