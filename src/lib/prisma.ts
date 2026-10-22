import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

function physicianInsertBlocked(): never {
  throw new Error(
    "PhysicianProfile is created only by a direct database insert.",
  );
}

function createPrisma() {
  const base = new PrismaClient({ adapter });
  return base.$extends({
    query: {
      physicianProfile: {
        async create() {
          physicianInsertBlocked();
        },
        async createMany() {
          physicianInsertBlocked();
        },
        async upsert() {
          physicianInsertBlocked();
        },
      },
    },
  });
}

type AppPrisma = ReturnType<typeof createPrisma>;

const globalForPrisma = global as unknown as { prisma?: AppPrisma };

const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
