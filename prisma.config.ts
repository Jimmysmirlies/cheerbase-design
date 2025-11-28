import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Ensure env vars are loaded even when Prisma skips auto-loading with a config file present.
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  seed: "tsc -p prisma/tsconfig.build.json && node prisma/dist/prisma/seed.js",
});
