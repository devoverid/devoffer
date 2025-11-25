import type { Event } from '@events/event'
import type { Checkin } from '@type/checkin'
import type { Client, MessageReaction, PartialMessageReaction, User } from 'discord.js'
import { CHECKIN_CHANNEL } from '@config/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { Events } from 'discord.js'
import { SubmittedCheckin } from '../validators/submitted-checkin'

export class SubmittedCheckinError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('SubmittedCheckinError', message, options)
    }
}

export default {
    name: Events.MessageReactionAdd,
    desc: 'Handles user-submitted checkin submissions with reacted by Flamewarden whether approved or rejected.',
    async exec(client: Client, reaction: MessageReaction | PartialMessageReaction, user: User) {
        const message = reaction.message
        const guild = message.guild
        if (user.bot)
            return
        if (!message.inGuild() || !guild)
            return
        if (reaction.partial)
            await reaction.fetch()
        if (message.partial)
            await message.fetch()

        try {
            const flamewarden = await guild.members.fetch(user.id)
            const emoji = reaction.emoji.name
            SubmittedCheckin.assertFlamewardenMember(flamewarden)
            SubmittedCheckin.assertEmojis(emoji)
            await SubmittedCheckin.assertAllowedChannel(guild, message.channel.id, CHECKIN_CHANNEL)

            const checkin = await SubmittedCheckin.getCheckinByURL(client.prisma, message.url)
            const updatedCheckin = await SubmittedCheckin.validateCheckin(client.prisma, flamewarden, checkin, emoji) as Checkin

            const member = await guild.members.fetch(checkin.user.discord_id)
            const newGrindRole = SubmittedCheckin.getNewGrindRole(guild, updatedCheckin.checkin_streak!.streak)
            await SubmittedCheckin.setMemberNewGrindRole(guild, member, newGrindRole)

            await SubmittedCheckin.sendCheckinStatusToMember(flamewarden, member, updatedCheckin)
        }
        catch (err: any) {
            if (!(err instanceof DiscordBaseError))
                log.error(`Failed to handle: ${SubmittedCheckin.ERR.UnexpectedSubmittedCheckinMessage}: ${err}`)
        }
    },
} as Event
