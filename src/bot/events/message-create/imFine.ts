import { Client, Message } from "discord.js"

export default {
  name: "messageCreate",
  desc: "Replying to a user when the user's chat contains 'fine' word",
  exec(client: Client, msg: Message) {
    if (!msg.author.bot && msg.content.includes("fine")) msg.reply("gua i'm fine😅")
  }
}