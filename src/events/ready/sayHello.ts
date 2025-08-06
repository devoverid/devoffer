import { Client } from "discord.js";

export default {
  name: "ready",
  desc: "Say こんにちは for the first load",
  once: true,
  exec(client: Client) {
    console.log(`こんにちは、${client.user?.tag}`);
  }
}