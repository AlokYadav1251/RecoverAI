import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { AppError } from '@/lib/api/errors';

describe('API Validation & Error Handling', () => {
  const schema = z.object({
    customerId: z.string().min(1),
    amount: z.number().positive(),
  });

  it('should validate correct payload schemas', () => {
    const valid = schema.safeParse({
      customerId: 'CUST-1001',
      amount: 4999,
    });
    expect(valid.success).toBe(true);
  });

  it('should reject invalid payload schemas with meaningful errors', () => {
    const invalid = schema.safeParse({
      customerId: '',
      amount: -500,
    });
    expect(invalid.success).toBe(false);
  });

  it('AppError should format status codes and error codes', () => {
    const notFound = AppError.notFound('Event not found');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.errorCode).toBe('NOT_FOUND');

    const unprocessable = AppError.unprocessable('Invalid params', { field: 'amount' });
    expect(unprocessable.statusCode).toBe(422);
    expect(unprocessable.errorCode).toBe('UNPROCESSABLE_ENTITY');
  });
});
