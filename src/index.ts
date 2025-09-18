import { Client, GatewayIntentBits } from "discord.js";
import { registerEvents } from "./bot/events/index"
import { registerCommands } from "./bot/commands"
import { prisma } from "./db/client"
import { log } from "./utils/logger";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
})
client.prisma = prisma

log.base("🚀 Starting bot...")
log.check(`Loading events...`)
await registerEvents(client)
log.success("Events loaded~")

log.check(`Loading commands...`)
await registerCommands(client)
log.success("Commands loaded~")

client.login(process.env.APP_TOKEN);
log.base("🚀 Bot is running!")