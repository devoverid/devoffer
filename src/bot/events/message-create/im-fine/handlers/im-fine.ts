import type { Event } from '@events/event'
import type { Interaction, Message } from 'discord.js'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { ImFine } from '../validators/im-fine'

export class ImFineError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('ImFineError', message, options)
    }
}

export default {
    name: 'messageCreate',
    desc: 'Replying to a user when the user\'s chat contains \'fine\' word',
    async exec(_, interaction: Interaction, msg: Message) {
        try {
            if (!interaction.inCachedGuild())
                throw new ImFineError(ImFine.ERR.NotGuild)

            if (!msg.author.bot && msg.content.includes('fine'))
                await msg.reply('gua i\'m fine😅')
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${ImFine.ERR.UnexpectedImFine}: ${err}`)
        }
    },
} as Event
