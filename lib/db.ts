import { PrismaClient } from "@prisma/client";

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // 本番: Turso (libSQL) を使用
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN ?? "",
    });
    const adapter = new PrismaLibSQL(client);
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }
  // 開発: ローカル SQLite
  return new PrismaClient({ log: ["error"] });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
