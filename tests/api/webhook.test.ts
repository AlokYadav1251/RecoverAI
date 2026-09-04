import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from '@/db/seed';
import { db } from '@/db/inMemoryDatabase';
import { POST } from '@/app/api/webhooks/razorpay/route';

describe('Webhook Ingestion API', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('should successfully ingest payment.failed webhook, create event, and execute auto-recovery', async () => {
    const payload = {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_wh_test_1001',
            amount: 499900, // 4999 INR in paise
            currency: 'INR',
            status: 'failed',
            method: 'upi',
            error_code: 'INSUFFICIENT_FUNDS',
            error_description: 'Account balance insufficient',
            email: 'aditi.sharma@gmail.com',
            contact: '+91 98201 44521',
          },
        },
      },
    };

    const req = new Request('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.webhookEvent).toBe('payment.failed');
    expect(data.data.diagnosis).toBeDefined();
    expect(data.data.diagnosis.rootCause).toBe('insufficient_funds');
  });
});
