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
  async queueNotification(userId: string, type: NotificationType, title: string, content: string, metadata?: any) {
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

  /**
   * Tâche 7.5 : Signalements (Boutique fermée, mauvais numéro, etc.)
   */
  async createReport(userId: string, storeId: string, reason: any, details?: string) {
    return this.prisma.report.create({
      data: {
        userId,
        storeId,
        reason,
        details,
      }
    });
  }
}
