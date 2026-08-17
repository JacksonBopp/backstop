import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate, studio) uses this. Neon's unpooled connection,
    // since pooled connections can't run schema migrations.
    url: env("DIRECT_URL"),
  },
});
