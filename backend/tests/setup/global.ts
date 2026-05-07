import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
}

export async function teardown(): Promise<void> {
  await pgContainer?.stop();
}