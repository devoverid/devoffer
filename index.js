require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

client.on("ready", () => {
  console.log(`こんにちは、${client.user.tag}`);
})

client.on("messageCreate", message => {
  if (message.content === "!ping") message.reply("Pong!")
  if (message.content.includes("fine")) message.reply("gua i'm fine😅")
})

client.login(process.env.APP_TOKEN);