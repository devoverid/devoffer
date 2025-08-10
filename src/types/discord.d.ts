import { Collection } from "discord.js";
import { PrismaClient } from "../../db/generated/prisma";
import { Command } from "../bot/commands";

declare module "discord.js" {
    interface Client {
      prisma: PrismaClient,
      commands: Collection<string, Command>
  }
}
  