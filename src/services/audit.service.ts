import { AuditLogRepository } from '@/db/repositories';
import { AuditLogRecord, ActorType } from '@/types/database';

export interface CreateAuditLogDTO {
  actor: string;
  actorType: ActorType;
  eventId?: string;
  campaignId?: string;
  action: string;
  reason: string;
  previousState?: string;
  newState?: string;
  policyResult?: 'PASSED' | 'BLOCKED' | 'REQUIRES_APPROVAL' | 'N/A';
  toolCalled?: string;
  toolResult?: string;
  idempotencyKey?: string;
  amount?: number;
  recoveredAmount?: number;
}

export class AuditService {
  static async log(dto: CreateAuditLogDTO): Promise<AuditLogRecord> {
    const entry: AuditLogRecord = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actor: dto.actor,
      actorType: dto.actorType,
      eventId: dto.eventId,
      campaignId: dto.campaignId,
      action: dto.action,
      reason: dto.reason,
      previousState: dto.previousState,
      newState: dto.newState,
      policyResult: dto.policyResult || 'PASSED',
      toolCalled: dto.toolCalled,
      toolResult: dto.toolResult,
      idempotencyKey: dto.idempotencyKey,
      amount: dto.amount,
      recoveredAmount: dto.recoveredAmount,
    };

    return AuditLogRepository.create(entry);
  }

  static async getAuditLogs(filter?: {
    actorType?: ActorType;
    eventId?: string;
    limit?: number;
  }): Promise<AuditLogRecord[]> {
    return AuditLogRepository.findAll(filter);
  }

  static async getEventAuditTrace(eventId: string): Promise<AuditLogRecord[]> {
    return AuditLogRepository.findAll({ eventId });
  }
}
