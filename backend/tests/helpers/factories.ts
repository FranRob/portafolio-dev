import type { PrismaClient, Project, ContactMessage } from '@prisma/client';

export interface CreateProjectInput {
  title: string;
  description: string;
  stack: string[];
  status: 'in_progress' | 'completed' | 'private';
  category: 'freelance' | 'personal' | 'collaborative';
  featured: boolean;
  order: number;
  repoUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  slug?: string;
  content?: string | null;
}

export interface CreateMessageInput {
  name: string;
  email: string;
  message: string;
  read?: boolean;
  category?: string;
}

/**
 * Insert a project into the database with sensible defaults.
 * Override any field by passing it in `overrides`.
 */
export async function createTestProject(
  prisma: PrismaClient,
  overrides?: Partial<CreateProjectInput>,
): Promise<Project> {
  const defaults: CreateProjectInput = {
    title: 'Test Project',
    description: 'A test project for integration testing',
    stack: ['TypeScript'],
    status: 'in_progress',
    category: 'personal',
    featured: false,
    order: 0,
    slug: `test-project-${Date.now()}`,
  };

  return prisma.project.create({
    data: { ...defaults, ...overrides },
  });
}

/**
 * Insert a contact message into the database with sensible defaults.
 * Override any field by passing it in `overrides`.
 */
export async function createTestMessage(
  prisma: PrismaClient,
  overrides?: Partial<CreateMessageInput>,
): Promise<ContactMessage> {
  const defaults: CreateMessageInput = {
    name: 'Test User',
    email: 'test@test.com',
    message: 'Test message',
  };

  return prisma.contactMessage.create({
    data: { ...defaults, ...overrides },
  });
}

/**
 * Pure factory — returns a project payload object without touching the DB.
 * Useful for POST /api/projects request body testing.
 */
export function buildCreateProjectPayload(
  overrides?: Partial<CreateProjectInput>,
): Record<string, unknown> {
  return {
    title: 'New Project',
    description: 'A new project',
    stack: ['Node.js'],
    status: 'in_progress',
    category: 'personal',
    order: 1,
    ...overrides,
  };
}
