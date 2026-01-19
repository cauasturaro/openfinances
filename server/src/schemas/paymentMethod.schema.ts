import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Payment Method name is required"),
  }),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>['body'];