import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerEvents } from "./events/index"
import { registerCommands } from "./commands"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

console.log("Loading events...")

await registerEvents(client)

console.log("Loading commands...")
await registerCommands(client)

console.log("Events loaded")
  

client.login(process.env.APP_TOKEN);

console.log("Bot is running")

