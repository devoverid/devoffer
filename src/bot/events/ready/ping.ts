import { Client, Message } from "discord.js"

export default {
  name: "ready",
  desc: "Say こんにちは for the first load",
  exec(client: Client, message: Message) {
    if (message.content === "!ping") message.reply("Pong!")
  }
} 