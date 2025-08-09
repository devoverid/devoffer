import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from ".."

export default {
  data: new SlashCommandBuilder()
    .setName("checkin")
    .setDescription("Daily grind check-in"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!")
    
  }
} as Command