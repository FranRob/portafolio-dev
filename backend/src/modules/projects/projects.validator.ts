import { z } from 'zod';

const optionalUrl = z.union([z.string().url(), z.literal('')]).nullable().optional();

// Slug param validation: lowercase alphanumeric with hyphens, no leading/trailing/double hyphens
export const slugParamSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const createProjectSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida').max(2000),
  stack: z.array(z.string()).min(1, 'Agregá al menos una tecnología'),
  status: z.enum(['in_progress', 'completed', 'private']),
  category: z.enum(['freelance', 'personal', 'collaborative']).default('personal'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  imageUrl: optionalUrl,
  content: z.string().nullable().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200).optional(),
  description: z.string().min(1, 'La descripción es requerida').max(2000).optional(),
  stack: z.array(z.string()).min(1, 'Agregá al menos una tecnología').optional(),
  status: z.enum(['in_progress', 'completed', 'private']).optional(),
  category: z.enum(['freelance', 'personal', 'collaborative']).optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  imageUrl: optionalUrl,
  slug: slugParamSchema.optional(),
  content: z.string().nullable().optional(),
});

// Solo UUIDs (los IDs se generan con @default(uuid()) en Prisma)
export const idSchema = z.string().uuid('El ID debe ser un UUID válido (ej: 550e8400-e29b-41d4-a716-446655440000)');

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;