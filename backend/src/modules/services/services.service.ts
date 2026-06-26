import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import type { ServiceResponse, ServiceDetailResponse, CreateServiceRequest, UpdateServiceRequest } from '../../dtos/index.js';
import { ConflictError } from '../../lib/errors.js';

export interface ServiceData {
  title: string;
  description: string;
  stack: string[];
  deliverables?: string[];
  tagline?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  estimatedTimeline?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
  featured?: boolean;
  order?: number;
  slug?: string;
  content?: string | null;
}

interface ServiceCreateData extends ServiceData {
  slug: string;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeUrls<T extends ServiceData>(data: T): T {
  return {
    ...data,
    imageUrl: data.imageUrl === '' ? null : data.imageUrl,
  };
}

function toResponse(service: {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  iconName: string | null;
  imageUrl: string | null;
  stack: string[];
  deliverables: string[];
  estimatedTimeline: string | null;
  priceRange: string | null;
  isActive: boolean;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): ServiceResponse {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    tagline: service.tagline,
    description: service.description,
    iconName: service.iconName,
    imageUrl: service.imageUrl,
    stack: service.stack,
    deliverables: service.deliverables,
    estimatedTimeline: service.estimatedTimeline,
    priceRange: service.priceRange,
    isActive: service.isActive,
    featured: service.featured,
    order: service.order,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

function toDetailResponse(service: {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  iconName: string | null;
  imageUrl: string | null;
  stack: string[];
  deliverables: string[];
  estimatedTimeline: string | null;
  priceRange: string | null;
  isActive: boolean;
  featured: boolean;
  order: number;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ServiceDetailResponse {
  return {
    ...toResponse(service),
    content: service.content,
  };
}

export async function listServices(): Promise<ServiceResponse[]> {
  const services = await prisma.service.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      tagline: true,
      description: true,
      iconName: true,
      imageUrl: true,
      stack: true,
      deliverables: true,
      estimatedTimeline: true,
      priceRange: true,
      isActive: true,
      featured: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return services.map(toResponse);
}

export async function findBySlug(slug: string): Promise<ServiceDetailResponse | null> {
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return null;
  return toDetailResponse(service);
}

export async function createService(data: CreateServiceRequest): Promise<ServiceResponse> {
  const slug = slugify(data.title);
  const createData: ServiceCreateData = { ...(data as ServiceData), slug };
  const service = await prisma.service.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: normalizeUrls(createData) as any,
  });
  return toResponse(service);
}

export async function updateService(id: string, data: UpdateServiceRequest): Promise<ServiceResponse | null> {
  try {
    if (data.order !== undefined) {
      const currentService = await prisma.service.findUnique({ where: { id } });
      if (!currentService) return null;

      const targetOrder = data.order;
      const conflictingService = await prisma.service.findFirst({
        where: { order: targetOrder, NOT: { id } },
      });

      if (conflictingService) {
        await prisma.service.update({
          where: { id: conflictingService.id },
          data: { order: currentService.order },
        });
      }
    }

    const service = await prisma.service.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: normalizeUrls({ ...data } as ServiceData) as any,
    });
    return toResponse(service);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictError('Ya existe un servicio con ese slug');
    }
    return null;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  try {
    await prisma.service.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
