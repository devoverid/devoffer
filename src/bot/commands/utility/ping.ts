import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "@commands/command"

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!")
  }
} as Command