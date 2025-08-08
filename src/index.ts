import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { registerEvents } from "./bot/events/index"
import { registerCommands } from "./bot/commands"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

console.log("Starting bot...")
console.log("Loading events...")
await registerEvents(client)
console.log("Events loaded~")

console.log("Loading commands...")
await registerCommands(client)
console.log("Commands loaded~")  

client.login(process.env.APP_TOKEN);
console.log("Bot is running!")