import { z } from 'zod';

export const createTransactionSchema = z.object({
  customerId: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
  type: z.enum(['GAVE', 'GOT'], { message: 'Type must be GAVE or GOT' }),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().datetime().optional()
});

export const updateTransactionSchema = z.object({
  type: z.enum(['GAVE', 'GOT'], { message: 'Type must be GAVE or GOT' }),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().datetime().optional()
});
