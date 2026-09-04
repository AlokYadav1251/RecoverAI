import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DEMO_MODE: z
    .string()
    .optional()
    .transform((val) => val === undefined || val === 'true' || val === '1'),
  PORT: z.string().optional().default('3000'),
  DATABASE_URL: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('RecoverAI'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: 'development' as const,
      DEMO_MODE: true,
      PORT: '3000',
      DATABASE_URL: undefined,
      RAZORPAY_KEY_ID: undefined,
      RAZORPAY_KEY_SECRET: undefined,
      NEXT_PUBLIC_APP_NAME: 'RecoverAI',
    };

export const isDemoMode = (): boolean => {
  return env.DEMO_MODE;
};

export const isProduction = (): boolean => {
  return env.NODE_ENV === 'production';
};
