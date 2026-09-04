import { RevenueRiskEvent, InterventionType, RecoveryPolicy } from '@/types';
import { formatINR } from './utils';

export interface PolicyValidationResult {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
  ruleCode: 'PASS' | 'MAX_RETRIES_EXCEEDED' | 'MAX_REMINDERS_EXCEEDED' | 'AMOUNT_LIMIT_EXCEEDED' | 'CUSTOMER_OPTED_OUT' | 'QUIET_HOURS_ACTIVE' | 'ALREADY_RECOVERED' | 'COOLDOWN_ACTIVE';
}

export class PolicyEngine {
  /**
   * Evaluates bounded rules and compliance before any recovery action executes
   */
  static validateAction(
    event: RevenueRiskEvent,
    action: InterventionType,
    policy: RecoveryPolicy
  ): PolicyValidationResult {
    // 1. Check if already recovered
    if (event.status === 'RECOVERED') {
      return {
        allowed: false,
        requiresApproval: false,
        reason: 'Event is already marked as RECOVERED. Further actions prohibited.',
        ruleCode: 'ALREADY_RECOVERED',
      };
    }

    // 2. Customer Opt-Out Safety
    if (event.customer.isOptedOut || action === 'DO_NOT_CONTACT') {
      return {
        allowed: false,
        requiresApproval: false,
        reason: 'Customer has opted out of communication. Recovery action stopped.',
        ruleCode: 'CUSTOMER_OPTED_OUT',
      };
    }

    // 3. Retry limits
    if (action === 'SMART_RETRY') {
      const maxRetries = event.type === 'SUBSCRIPTION_FAILURE' 
        ? policy.maxSubscriptionRetries 
        : policy.maxPaymentRetries;

      if (event.retryCount >= maxRetries) {
        return {
          allowed: false,
          requiresApproval: false,
          reason: `Maximum retry limit (${maxRetries}) reached for this event. Escalating to manual review.`,
          ruleCode: 'MAX_RETRIES_EXCEEDED',
        };
      }
    }

    // 4. Reminder limits
    if (action === 'RECOVERY_REMINDER' || action === 'PAYMENT_LINK') {
      if (event.reminderCount >= policy.maxReminders) {
        return {
          allowed: false,
          requiresApproval: false,
          reason: `Maximum reminder limit (${policy.maxReminders}) reached. Further automated contact blocked.`,
          ruleCode: 'MAX_REMINDERS_EXCEEDED',
        };
      }
    }

    // 5. Amount Limit & High Risk Approval Gate
    if (event.amount > policy.maxAutomatedRecoveryAmount) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: `Amount (${formatINR(event.amount)}) exceeds automated threshold (${formatINR(policy.maxAutomatedRecoveryAmount)}). Merchant approval required.`,
        ruleCode: 'AMOUNT_LIMIT_EXCEEDED',
      };
    }

    // 6. Probability Score threshold for auto-approval
    if (event.recoveryProbability < policy.autoApproveConfidenceScore && action !== 'MANUAL_REVIEW') {
      return {
        allowed: true,
        requiresApproval: true,
        reason: `Recovery probability (${event.recoveryProbability}%) is below auto-execution threshold (${policy.autoApproveConfidenceScore}%). Merchant confirmation requested.`,
        ruleCode: 'PASS',
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      reason: 'All bounded safety and compliance rules satisfied.',
      ruleCode: 'PASS',
    };
  }

  /**
   * Checks whether the recovery workflow should immediately terminate
   */
  static shouldStopWorkflow(event: RevenueRiskEvent, policy: RecoveryPolicy): { stop: boolean; reason?: string } {
    if (policy.stopIfPaymentSuccess && event.status === 'RECOVERED') {
      return { stop: true, reason: 'Payment successfully captured.' };
    }
    if (policy.stopIfCustomerOptout && event.customer.isOptedOut) {
      return { stop: true, reason: 'Customer opt-out received.' };
    }
    if (policy.stopIfMaxAttemptsReached && event.retryCount >= policy.maxPaymentRetries) {
      return { stop: true, reason: `Max retry limit (${policy.maxPaymentRetries}) reached.` };
    }
    if (policy.stopIfManualReviewRequired && event.status === 'MANUAL_REVIEW') {
      return { stop: true, reason: 'Flagged for merchant manual review.' };
    }
    return { stop: false };
  }

  /**
   * Quiet hours check (e.g. 9 PM to 8 AM IST)
   */
  static isWithinQuietHours(policy: RecoveryPolicy): boolean {
    if (!policy.quietHoursEnabled) return false;
    const now = new Date();
    const hours = now.getHours();
    return hours >= 21 || hours < 8;
  }
}
