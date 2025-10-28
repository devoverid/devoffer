import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!')
    },
} as Command
