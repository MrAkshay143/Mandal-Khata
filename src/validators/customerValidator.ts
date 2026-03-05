import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema;
