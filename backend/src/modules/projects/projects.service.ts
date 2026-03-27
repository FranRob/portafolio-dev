import prisma from '../../lib/prisma.js';
import type { ProjectStatus, ProjectCategory } from '@prisma/client';

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

export async function listProjects() {
  return prisma.project.findMany({ orderBy: { order: 'asc' } });
}

export async function createProject(data: ProjectData) {
  return prisma.project.create({ data });
}

export async function updateProject(id: string, data: Partial<ProjectData>) {
  return prisma.project.update({ where: { id }, data });
  // Throws PrismaClientKnownRequestError P2025 if not found — caught in route → 404
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
  // Same error → 404 in route
}
