require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js")
const { loadEvents } = require("./events")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

loadEvents(client)
// client.on("ready", () => {
//   console.log(message);
//   if (message.content === "!ping") message.reply("Pong!")
//   if (message.content.includes("fine")) message.reply("gua i'm fine😅")
// })
// client.on("messageCreate", message => {
//   console.log(message);
//   if (message.content === "!ping") message.reply("Pong!")
//   if (message.content.includes("fine")) message.reply("gua i'm fine😅")
// })

client.login(process.env.APP_TOKEN);