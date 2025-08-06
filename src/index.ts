import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { loadEvents } from "./events"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

console.log("Loading events...")

await loadEvents(client)

console.log("Events loaded")
  

client.login(process.env.APP_TOKEN);

console.log("Bot is running")