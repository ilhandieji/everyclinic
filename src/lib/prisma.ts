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

/** Bump when models are added so the dev singleton is not reused after `prisma generate`. */
const PRISMA_CLIENT_REV = 2;

const globalForPrisma = global as unknown as {
  prisma?: AppPrisma;
  prismaRev?: number;
};

function resolvePrisma(): AppPrisma {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaRev === PRISMA_CLIENT_REV &&
    typeof cached.bookingDay?.findMany === "function"
  ) {
    return cached;
  }
  const created = createPrisma();
  globalForPrisma.prisma = created;
  globalForPrisma.prismaRev = PRISMA_CLIENT_REV;
  return created;
}

const prisma = new Proxy({} as AppPrisma, {
  get(_target, prop) {
    const client = resolvePrisma();
    const value = Reflect.get(client, prop, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
