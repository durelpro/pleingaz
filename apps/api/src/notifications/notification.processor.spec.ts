jest.mock('@nestjs/bullmq', () => ({
  Processor: () => () => {},
  WorkerHost: class {},
}));
jest.mock('bullmq', () => ({
  Job: class {},
}));

import { NotificationProcessor } from './notification.processor';

describe('NotificationProcessor (Worker BullMQ Multi-Canaux)', () => {
  let processor: NotificationProcessor;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    processor = new NotificationProcessor(prisma);
  });

  it('devrait traiter et marquer SENT une notification WhatsApp avec succès', async () => {
    prisma.notification.findUnique.mockResolvedValue({
      id: 'notif-1',
      type: 'WHATSAPP',
      content: 'Votre commande est prête',
      user: { phone: '+237699112233' },
    });
    prisma.notification.update.mockResolvedValue({ id: 'notif-1', status: 'SENT' });

    const job = { data: { notificationId: 'notif-1' } } as any;
    await processor.process(job);

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: { status: 'SENT' },
    });
  });

  it('devrait traiter et marquer SENT une notification Email avec succès', async () => {
    prisma.notification.findUnique.mockResolvedValue({
      id: 'notif-2',
      type: 'EMAIL',
      content: 'Votre facture est disponible',
      user: { email: 'client@example.com' },
    });
    prisma.notification.update.mockResolvedValue({ id: 'notif-2', status: 'SENT' });

    const job = { data: { notificationId: 'notif-2' } } as any;
    await processor.process(job);

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-2' },
      data: { status: 'SENT' },
    });
  });

  it('devrait passer le statut à FAILED et relancer l’exception en cas d’échec', async () => {
    prisma.notification.findUnique.mockResolvedValue({
      id: 'notif-3',
      type: 'WHATSAPP',
      content: 'Test',
      user: { phone: null }, // Provoquera une exception si non géré ou simuler erreur update
    });
    prisma.notification.update
      .mockRejectedValueOnce(new Error('Erreur de transport réseau'))
      .mockResolvedValueOnce({ id: 'notif-3', status: 'FAILED' });

    const job = { data: { notificationId: 'notif-3' } } as any;
    await expect(processor.process(job)).rejects.toThrow();

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-3' },
      data: { status: 'FAILED' },
    });
  });
});
