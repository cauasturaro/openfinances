import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    description: z.string().min(3, "Description must be at least 3 characters"),
    amount: z.number({ required_error: "Amount is required" }),
    date: z.coerce.date(), 
    categoryId: z.number(),
    paymentMethodId: z.number(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];