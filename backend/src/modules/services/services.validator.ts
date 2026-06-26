import { z } from 'zod';

const optionalUrl = z.union([z.string().url(), z.literal('')]).nullable().optional();

export const slugParamSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const createServiceSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida').max(2000),
  stack: z.array(z.string()).min(1, 'Agregá al menos una tecnología'),
  deliverables: z.array(z.string()).optional(),
  tagline: z.string().optional(),
  iconName: z.string().optional(),
  imageUrl: optionalUrl,
  estimatedTimeline: z.string().optional(),
  priceRange: z.string().optional(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  content: z.string().nullable().optional(),
});

export const updateServiceSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200).optional(),
  description: z.string().min(1, 'La descripción es requerida').max(2000).optional(),
  stack: z.array(z.string()).min(1, 'Agregá al menos una tecnología').optional(),
  deliverables: z.array(z.string()).optional(),
  tagline: z.string().optional(),
  iconName: z.string().optional(),
  imageUrl: optionalUrl,
  estimatedTimeline: z.string().optional(),
  priceRange: z.string().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  content: z.string().nullable().optional(),
  slug: slugParamSchema.optional(),
});

export const idSchema = z.string().min(1, 'El ID es requerido');

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
