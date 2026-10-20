// Load reference data (see src/lib/server/seed.ts). Idempotent.
//   npm run db:seed
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/server/seed";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
