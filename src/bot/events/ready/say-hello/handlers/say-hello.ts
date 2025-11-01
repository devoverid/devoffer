import type { Event } from '@events/event'
import type { Client, Interaction } from 'discord.js'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { SayHello } from '../validators/say-hello'

export class SayHelloError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('SayHelloError', message, options)
    }
}

export default {
    name: 'ready',
    desc: 'Say こんにちは for the first load',
    once: true,
    exec(client: Client, interaction: Interaction) {
        try {
            if (!interaction.inCachedGuild())
                throw new SayHelloError(SayHello.ERR.NotGuild)

            console.warn(`こんにちは、${client.user?.tag}`)
        }
        catch (err: any) {
            log.error(`Failed to handle ${SayHello.ERR.UnexpectedSayHello}: ${err}`)
        }
    },
} as Event
