import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ notificationId: string }>) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: job.data.notificationId },
      include: { user: true }
    });

    if (!notification) return;

    try {
      if (notification.type === 'WHATSAPP') {
        // TODO: Appel API WhatsApp Business (Tâche 7.3)
        // const supportPhone = "+237 657696567";
        console.log(\`[WHATSAPP] Envoi à \${notification.user.phoneNumber}: \${notification.content}\`);
      } else if (notification.type === 'EMAIL') {
        // TODO: Appel API SendGrid/Mailgun ou autre
        // const supportEmail = "donfackdurel1980@icloud.com";
        console.log(\`[EMAIL] Envoi à \${notification.user.email}: \${notification.content}\`);
      } else {
        console.log(\`[IN_APP] Envoi de push notification: \${notification.title}\`);
      }

      // Succès
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT' }
      });

    } catch (error) {
      console.error(\`Erreur lors de l'envoi de la notification \${notification.id}\`, error);
      // On met à jour en FAILED. Si BullMQ refait une tentative, ça retentera
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' }
      });
      throw error; // Pour déclencher le backoff de BullMQ
    }
  }
}
