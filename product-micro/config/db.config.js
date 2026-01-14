import { PrismaClient } from "@prisma/client";

// very simple Prisma client, same idea as auth service
const prisma = new PrismaClient({
  log: ["query", "error"],
});

export default prisma;

