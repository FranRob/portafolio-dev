import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");

let pgContainer: StartedPostgreSqlContainer;

export async function setup(): Promise<void> {
  // Start PostgreSQL container
  pgContainer = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("portafolio_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const connectionUri = pgContainer.getConnectionUri();

  // Set environment variables before any import
  process.env["DATABASE_URL"] = connectionUri;
  process.env["JWT_SECRET"] = "test-secret-key-that-is-at-least-32-characters-long";
  process.env["NODE_ENV"] = "test";
  process.env["ADMIN_EMAIL"] = "admin@example.com";
  process.env["ADMIN_PASSWORD"] = "testpassword";

  // Run migrations against the test container
  execSync("npx prisma migrate deploy", {
    cwd: backendRoot,
    env: {
      ...process.env,
      DATABASE_URL: connectionUri,
    },
    stdio: "pipe",
  });

  // Seed baseline data
  await seedBaseline();
}

/**
 * Seed baseline data after migrations: 1 admin, 2 projects, 2 messages.
 */
async function seedBaseline(): Promise<void> {
  // Dynamic import after DATABASE_URL is set — singleton initializes with test container URL
  const { default: prisma } = await import("../../src/lib/prisma.js");

  try {
    // Seed admin user
    const adminPasswordHash = await bcrypt.hash(
      process.env["ADMIN_PASSWORD"] ?? "testpassword",
      10,
    );
    await prisma.adminUser.upsert({
      where: { email: process.env["ADMIN_EMAIL"] ?? "admin@example.com" },
      create: {
        email: process.env["ADMIN_EMAIL"] ?? "admin@example.com",
        passwordHash: adminPasswordHash,
      },
      update: {
        passwordHash: adminPasswordHash,
      },
    });

    // Seed 2 test projects (fixed UUIDs)
    const project1Id = "00000000-0000-0000-0000-000000000001";
    const project2Id = "00000000-0000-0000-0000-000000000002";

    await prisma.project.upsert({
      where: { id: project1Id },
      create: {
        id: project1Id,
        title: "Seed Project 1",
        description: "First seeded project for testing",
        stack: ["TypeScript", "React"],
        status: "completed",
        category: "personal",
        order: 0,
      },
      update: {},
    });

    await prisma.project.upsert({
      where: { id: project2Id },
      create: {
        id: project2Id,
        title: "Seed Project 2",
        description: "Second seeded project for testing",
        stack: ["Node.js", "PostgreSQL"],
        status: "in_progress",
        category: "freelance",
        order: 1,
      },
      update: {},
    });

    // Seed 2 test messages (fixed UUIDs)
    const message1Id = "00000000-0000-0000-0000-000000000010";
    const message2Id = "00000000-0000-0000-0000-000000000011";

    await prisma.contactMessage.upsert({
      where: { id: message1Id },
      create: {
        id: message1Id,
        name: "John Doe",
        email: "john@example.com",
        message: "Hello, great portfolio!",
        read: false,
      },
      update: {},
    });

    await prisma.contactMessage.upsert({
      where: { id: message2Id },
      create: {
        id: message2Id,
        name: "Jane Smith",
        email: "jane@example.com",
        message: "Interested in collaborating",
        read: true,
        category: "leido",
      },
      update: {},
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function teardown(): Promise<void> {
  await pgContainer?.stop();
}