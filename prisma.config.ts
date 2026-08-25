import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate, studio) uses this. Neon's unpooled connection,
    // since pooled connections can't run schema migrations.
    // Falls back to a placeholder so `prisma generate` (run from postinstall
    // on every `npm install`, including the very first Vercel build before
    // any database is connected) never fails just because this isn't set yet.
    // Only `migrate`/`studio` actually need a real value here.
    url: process.env.DIRECT_URL || "postgresql://placeholder:placeholder@localhost:5432/iio",
  },
});
