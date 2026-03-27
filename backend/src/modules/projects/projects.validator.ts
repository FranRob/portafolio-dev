import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  stack: z.array(z.string()),
  status: z.enum(['in_progress', 'completed', 'private']),
  category: z.enum(['freelance', 'personal', 'collaborative']).default('personal'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  repoUrl: z.string().url().nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const idSchema = z.string().uuid();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
