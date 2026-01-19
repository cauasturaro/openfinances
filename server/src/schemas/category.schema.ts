import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];