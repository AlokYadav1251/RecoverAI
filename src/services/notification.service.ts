import { NotificationRepository, CustomerRepository } from '@/db/repositories';
import { NotificationRecord } from '@/types/database';
import { AuditService } from './audit.service';

export interface SendNotificationDTO {
  eventId: string;
  customerId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  messageContent: string;
}

export class NotificationService {
  static async sendNotification(dto: SendNotificationDTO): Promise<NotificationRecord> {
    const customer = await CustomerRepository.findById(dto.customerId);
    if (!customer) {
      throw new Error(`Customer ${dto.customerId} not found`);
    }

    if (customer.isOptedOut) {
      throw new Error(`Customer ${dto.customerId} is opted out from notifications.`);
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: NotificationRecord = {
      id: notificationId,
      eventId: dto.eventId,
      customerId: dto.customerId,
      channel: dto.channel,
      messageContent: dto.messageContent,
      providerMessageId: `msg_${dto.channel.toLowerCase()}_${Date.now()}`,
      deliveryStatus: 'SENT',
      sentAt: now,
    };

    const saved = await NotificationRepository.save(record);

    await AuditService.log({
      actor: 'NotificationService',
      actorType: 'AI_AGENT',
      eventId: dto.eventId,
      action: 'NOTIFICATION_SENT',
      reason: `Dispatched ${dto.channel} recovery message to ${customer.name}`,
      policyResult: 'PASSED',
    });

    return saved;
  }

  static async getNotificationsForEvent(eventId: string): Promise<NotificationRecord[]> {
    return NotificationRepository.findByEventId(eventId);
  }
}
