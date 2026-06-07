import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  // Strip sslmode from the connection string so that pg driver does not override rejectUnauthorized
  let sanitizedConnectionString = connectionString;
  if (sanitizedConnectionString.includes("sslmode=")) {
    sanitizedConnectionString = sanitizedConnectionString
      .replace(/([\?&])sslmode=[^&]*(&|$)/, "$1")
      .replace(/[\?&]$/, "");
  }

  const adapter = new PrismaPg({
    connectionString: sanitizedConnectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
