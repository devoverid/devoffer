import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction } from 'discord.js'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { SlashCommandBuilder } from 'discord.js'
import { Ping } from '../validators/ping'

export class PingError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('PingError', message, options)
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new PingError(Ping.ERR.NotGuild)

            await interaction.reply('Pong!')
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${Ping.ERR.UnexpectedPing}: ${err}`)
        }
    },
} as Command
