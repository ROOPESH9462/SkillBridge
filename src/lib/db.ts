import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // If external DATABASE_URL is set (Postgres, Neon, Supabase, etc.)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return new PrismaClient();
  }

  // Handle Vercel read-only filesystem for SQLite by copying dev.db to writable /tmp
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      const tmpDbPath = "/tmp/dev.db";
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(process.cwd(), "dev.db"),
        ];

        let foundPath: string | null = null;
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            foundPath = p;
            break;
          }
        }

        if (foundPath) {
          fs.copyFileSync(foundPath, tmpDbPath);
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return new PrismaClient({
          datasources: {
            db: {
              url: `file:${tmpDbPath}`,
            },
          },
        });
      }
    } catch (e) {
      console.error("Vercel DB copy error:", e);
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
