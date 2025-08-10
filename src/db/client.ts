import { PrismaClient } from "../../db/generated/prisma";

// singleton
export const prisma = new PrismaClient();
