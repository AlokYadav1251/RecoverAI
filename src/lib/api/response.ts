import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { AppError } from './errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  statusCode: number = 400,
  errorCode: string = 'BAD_REQUEST',
  details?: unknown
) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export async function validateRequestBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw AppError.badRequest('Invalid JSON body payload');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.unprocessable('Input validation failed', result.error.format());
  }

  return result.data;
}

export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return errorResponse(err.message, err.statusCode, err.errorCode, err.details);
      }

      if (err instanceof ZodError) {
        return errorResponse('Validation failed', 422, 'VALIDATION_ERROR', err.format());
      }

      console.error('Unhandled API Server Error:', err);
      return errorResponse('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
    }
  };
}
