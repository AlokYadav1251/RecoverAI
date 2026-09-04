import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { WebhookEventPayload } from '@/types';
import { 
  Zap, 
  CreditCard, 
  ShoppingCart, 
  RefreshCw, 
  FileText, 
  CheckCircle,
  Radio,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (eventId: string) => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const { triggerWebhook } = useRecoverStore();
  const [selectedEventType, setSelectedEventType] = useState<WebhookEventPayload['event']>('payment.failed');
  const [simulatedAmount, setSimulatedAmount] = useState<number>(4999);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('INSUFFICIENT_FUNDS');
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const eventTemplates = [
    {
      event: 'payment.failed' as const,
      label: 'Payment Failed',
      icon: CreditCard,
      defaultAmount: 4999,
      description: 'Simulates a UPI/Card authorization failure (e.g. INSUFFICIENT_FUNDS or BANK_DECLINE)',
    },
    {
      event: 'checkout.abandoned' as const,
      label: 'Checkout Abandoned',
      icon: ShoppingCart,
      defaultAmount: 8500,
      description: 'Simulates a buyer dropping off at the final payment gateway screen',
    },
    {
      event: 'subscription.failed' as const,
      label: 'Subscription Mandate Failed',
      icon: RefreshCw,
      defaultAmount: 2999,
      description: 'Simulates recurring e-mandate auto-debit failure due to gateway timeout',
    },
    {
      event: 'invoice.overdue' as const,
      label: 'Overdue B2B Invoice',
      icon: FileText,
      defaultAmount: 150000,
      description: 'Simulates corporate invoice crossing due date without payment receipt',
    },
  ];

  const handleSimulate = async (evType?: WebhookEventPayload['event'], amt?: number) => {
    setIsProcessing(true);
    setDispatchError(null);
    
    try {
      // For quick-trigger buttons, use defaults (no validation needed)
      if (evType && amt && !customerName && !customerEmail) {
        const createdEvent = await triggerWebhook({
          event: evType,
          data: { amount: amt, error_code: 'INSUFFICIENT_FUNDS', bank: 'HDFC' },
        });

        setLastCreatedId(createdEvent.id);
        if (onEventCreated) {
          onEventCreated(createdEvent.id);
        }
        return;
      }

      // For custom form, validate customer data
      const errors: ValidationError[] = [];

      if (!customerName.trim()) {
        errors.push({ field: 'customerName', message: 'Customer name is required' });
      }

      if (!customerEmail.trim()) {
        errors.push({ field: 'customerEmail', message: 'Email is required' });
      } else if (!isValidEmail(customerEmail)) {
        errors.push({ field: 'customerEmail', message: 'Please enter a valid email address' });
      }

      if (simulatedAmount <= 0) {
        errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
      }

      if (!failureReason.trim()) {
        errors.push({ field: 'failureReason', message: 'Failure reason is required' });
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsProcessing(false);
        return;
      }

      // Clear errors if validation passes
      setValidationErrors([]);

      // Persist the webhook through the backend before updating the inbox.
      const targetType = selectedEventType;
      const createdEvent = await triggerWebhook({
        event: targetType,
        data: { amount: simulatedAmount, error_code: failureReason, bank: 'HDFC' },
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        failureReason: failureReason,
      });

      setLastCreatedId(createdEvent.id);
      if (onEventCreated) {
        onEventCreated(createdEvent.id);
      }
    } catch (error: unknown) {
      setDispatchError(error instanceof Error ? error.message : 'Webhook could not be saved');
    } finally {
      setIsProcessing(false);
    }
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorForField = (field: string): string | undefined => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Real-time Webhook Event Simulator</span>
        </div>
      }
      description="Simulate real-time fintech risk webhooks from payment gateways and commerce platforms to observe autonomous agent detection."
    >
      <div className="space-y-4">
        {/* Quick 1-Click Trigger Pills */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono block mb-2">
            1-Click Quick Simulators
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {eventTemplates.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <button
                  key={tmpl.event}
                  onClick={async () => {
                    setSelectedEventType(tmpl.event);
                    setSimulatedAmount(tmpl.defaultAmount);
                    await handleSimulate(tmpl.event, tmpl.defaultAmount);
                  }}
                  disabled={isProcessing}
                  className={`p-3 rounded-xl bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/60 text-left transition-all group flex items-start justify-between cursor-pointer ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-white group-hover:text-indigo-300">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {tmpl.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{tmpl.description}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded shrink-0 ml-2">
                    {formatINR(tmpl.defaultAmount)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Event Trigger Form */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Custom Event Payload Builder
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setValidationErrors(validationErrors.filter(e => e.field !== 'customerName'));
                }}
                placeholder="e.g., Amit Kumar"
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                  getErrorForField('customerName') ? 'border-red-600' : 'border-slate-700'
                }`}
              />
              {getErrorForField('customerName') && (
                <div className="text-[10px] text-red-400 mt-1">{getErrorForField('customerName')}</div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Customer Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setValidationErrors(validationErrors.filter(e => e.field !== 'customerEmail'));
                }}
                placeholder="e.g., amit.kumar@gmail.com"
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                  getErrorForField('customerEmail') ? 'border-red-600' : 'border-slate-700'
                }`}
              />
              {getErrorForField('customerEmail') && (
                <div className="text-[10px] text-red-400 mt-1">{getErrorForField('customerEmail')}</div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Event Type</label>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="payment.failed">payment.failed (UPI / Card)</option>
                <option value="checkout.abandoned">checkout.abandoned (Cart Drop-off)</option>
                <option value="subscription.failed">subscription.failed (NACH Mandate)</option>
                <option value="invoice.overdue">invoice.overdue (B2B Receivable)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Failure Reason *</label>
              <select
                value={failureReason}
                onChange={(e) => {
                  setFailureReason(e.target.value);
                  setValidationErrors(validationErrors.filter(e => e.field !== 'failureReason'));
                }}
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                  getErrorForField('failureReason') ? 'border-red-600' : 'border-slate-700'
                }`}
              >
                <option value="">-- Select a reason --</option>
                <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
                <option value="BANK_DECLINE">Bank Decline</option>
                <option value="CARD_EXPIRED">Card Expired</option>
                <option value="AUTH_FAILED">Authentication Failed</option>
                <option value="OTP_TIMEOUT">OTP Timeout</option>
                <option value="TEMPORARY_BANK_OUTAGE">Temporary Bank Outage</option>
                <option value="NETWORK_TIMEOUT">Network Timeout</option>
              </select>
              {getErrorForField('failureReason') && (
                <div className="text-[10px] text-red-400 mt-1">{getErrorForField('failureReason')}</div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Amount (INR) *</label>
              <input
                type="number"
                value={simulatedAmount}
                onChange={(e) => {
                  setSimulatedAmount(Number(e.target.value));
                  setValidationErrors(validationErrors.filter(e => e.field !== 'amount'));
                }}
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                  getErrorForField('amount') ? 'border-red-600' : 'border-slate-700'
                }`}
              />
              {getErrorForField('amount') && (
                <div className="text-[10px] text-red-400 mt-1">{getErrorForField('amount')}</div>
              )}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-800 text-[11px] text-red-300">
              <div className="font-semibold mb-1">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {dispatchError && (
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-800 text-[11px] text-red-300">
              {dispatchError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="glow"
              size="sm"
              onClick={() => handleSimulate()}
              disabled={isProcessing}
            >
              <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> 
              {isProcessing ? 'Processing webhook...' : 'Dispatch Webhook to Agent'}
            </Button>
          </div>
        </div>

        {/* Success Confirmation */}
        {lastCreatedId && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Event <strong>{lastCreatedId}</strong> ingested into Revenue Risk Inbox.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
              }}
              className="text-[11px] py-0.5 h-6 text-emerald-300 border-emerald-700"
            >
              View in Inbox <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
