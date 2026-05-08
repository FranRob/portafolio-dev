import { z } from 'zod';

const optionalUrl = z.union([z.string().url(), z.literal('')]).nullable().optional();

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
});

// Acepta UUID (ej: 550e8400-e29b-41d4-a716-446655440000) O slug (ej: proj-barber-saas-003)
export const idSchema = z.string().regex(/^(proj-[a-z0-9-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, 
  'El ID debe ser UUID (ej: 550e8400-e29b-41d4-a716-446655440000) o slug (ej: proj-barber-saas-003)'
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;