import prisma from '../../lib/prisma.js';
import type { ProjectStatus, ProjectCategory } from '@prisma/client';
import type { ProjectResponse, CreateProjectRequest, UpdateProjectRequest } from '../../dtos/index.js';

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
}

// Normalize empty strings to null for optional URL fields
function normalizeUrls(data: ProjectData): ProjectData {
  return {
    ...data,
    repoUrl: data.repoUrl === '' ? null : data.repoUrl,
    demoUrl: data.demoUrl === '' ? null : data.demoUrl,
    imageUrl: data.imageUrl === '' ? null : data.imageUrl,
  };
}

// Convert Prisma model to API response DTO
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
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function listProjects(): Promise<ProjectResponse[]> {
  const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } });
  return projects.map(toResponse);
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  const project = await prisma.project.create({ data: normalizeUrls(data as ProjectData) });
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

    const project = await prisma.project.update({ where: { id }, data: normalizeUrls({ ...data } as ProjectData) });
    return toResponse(project);
  } catch {
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
