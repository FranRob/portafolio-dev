import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/setup/global.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: "forks",
    fileParallelism: false,
  },
});