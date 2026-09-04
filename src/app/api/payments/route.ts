import { z } from 'zod';
import { PaymentService } from '@/services/payment.service';
import { PaymentRepository } from '@/db/repositories';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const createPaymentSchema = z.object({
  merchantId: z.string().optional().default('MERCHANT_DEFAULT'),
  customerId: z.string().min(1, 'customerId is required'),
  amount: z.number().positive('amount must be positive'),
  currency: z.string().optional().default('INR'),
  paymentMethod: z.enum(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'NACH', 'WALLET']),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
});

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');
  const status = searchParams.get('status') as any;

  if (customerId) {
    const payments = await PaymentService.getCustomerPayments(customerId);
    return successResponse(payments);
  }

  const payments = await PaymentRepository.findAll({ status });
  return successResponse(payments);
});

export const POST = withErrorHandler(async (req: Request) => {
  const payload = await validateRequestBody(req, createPaymentSchema);
  const result = await PaymentService.createPayment(payload);
  return successResponse(result, 'Payment executed', result.success ? 201 : 400);
});
