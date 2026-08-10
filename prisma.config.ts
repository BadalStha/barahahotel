import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 6+ configuration (replaces the deprecated `package.json#prisma`
 * block). The datasource URL/directUrl stay declared in schema.prisma;
 * `import "dotenv/config"` loads .env because the CLI no longer auto-loads
 * it when a config file is present.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
