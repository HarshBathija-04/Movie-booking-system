import { defineConfig } from "vitest/config";

// Set before any app module loads config, so tests use an isolated schema.
process.env.NODE_ENV = "test";
process.env.DB_SCHEMA = process.env.TEST_DB_SCHEMA || "movie_booking_test";

export default defineConfig({
  test: {
    globalSetup: ["./tests/globalSetup.js"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
