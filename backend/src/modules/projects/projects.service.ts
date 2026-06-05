import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import type { ProjectStatus, ProjectCategory } from '@prisma/client';
import type { ProjectResponse, ProjectDetailResponse, CreateProjectRequest, UpdateProjectRequest } from '../../dtos/index.js';
import { ConflictError } from '../../lib/errors.js';

export interface ProjectData {
  title: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  repoUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  slug?: string;
  content?: string | null;
}

// Full create data with required slug (used by createProject)
interface ProjectCreateData extends ProjectData {
  slug: string;
}

/**
 * Convert a title string into a URL-safe slug.
 * Lowercases, replaces non-alphanumeric runs with hyphens,
 * and trims leading/trailing hyphens.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Normalize empty strings to null for optional URL fields
function normalizeUrls<T extends ProjectData>(data: T): T {
  return {
    ...data,
    repoUrl: data.repoUrl === '' ? null : data.repoUrl,
    demoUrl: data.demoUrl === '' ? null : data.demoUrl,
    imageUrl: data.imageUrl === '' ? null : data.imageUrl,
  };
}

// Convert Prisma model to list API response DTO (excludes content)
function toResponse(project: {
  id: string;
  title: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectResponse {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    stack: project.stack,
    status: project.status,
    category: project.category,
    featured: project.featured,
    order: project.order,
    repoUrl: project.repoUrl,
    demoUrl: project.demoUrl,
    imageUrl: project.imageUrl,
    slug: project.slug,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

// Convert Prisma model to detail API response DTO (includes content)
function toDetailResponse(project: {
  id: string;
  title: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  slug: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectDetailResponse {
  return {
    ...toResponse(project),
    content: project.content,
  };
}

export async function listProjects(): Promise<ProjectResponse[]> {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      stack: true,
      status: true,
      category: true,
      featured: true,
      order: true,
      repoUrl: true,
      demoUrl: true,
      imageUrl: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      // content intentionally excluded for performance
    },
  });
  return projects.map(toResponse);
}

export async function findBySlug(slug: string): Promise<ProjectDetailResponse | null> {
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return null;
  return toDetailResponse(project);
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  const slug = slugify(data.title);
  const createData: ProjectCreateData = { ...(data as ProjectData), slug };
  const project = await prisma.project.create({
    data: normalizeUrls(createData),
  });
  return toResponse(project);
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse | null> {
  try {
    // Si se está cambiando el order, verificar si hay conflicto y hacer swap
    if (data.order !== undefined) {
      const currentProject = await prisma.project.findUnique({ where: { id } });
      if (!currentProject) return null;

      const targetOrder = data.order;

      // Buscar si hay otro proyecto con ese order
      const conflictingProject = await prisma.project.findFirst({
        where: { order: targetOrder, NOT: { id } },
      });

      if (conflictingProject) {
        // Swap: el proyecto que estaba en esa posición pasa al order antiguo
        await prisma.project.update({
          where: { id: conflictingProject.id },
          data: { order: currentProject.order },
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: normalizeUrls({ ...data } as ProjectData),
    });
    return toResponse(project);
  } catch (err) {
    // Prisma unique constraint violation (slug conflict)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictError('Ya existe un proyecto con ese slug');
    }
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
