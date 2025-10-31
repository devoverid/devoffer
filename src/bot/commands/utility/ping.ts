import type { Command } from '@commands/command'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    async execute(interaction) {
        await interaction.reply('Pong!')
    },
} as Command
