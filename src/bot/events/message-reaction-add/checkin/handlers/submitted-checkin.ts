import type { Event } from '@events/event'
import type { Checkin as CheckinType } from '@type/checkin'
import type { Client, MessageReaction, PartialMessageReaction, User } from 'discord.js'
import { CHECKIN_CHANNEL, FLAMEWARDEN_ROLE } from '@config/discord'
import { Checkin } from '@events/interaction-create/checkin/validators/checkin'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { Events } from 'discord.js'

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
            const emoji = Checkin.assertEmojis(reaction.emoji.name)
            Checkin.assertMemberHasRole(flamewarden, FLAMEWARDEN_ROLE)
            await Checkin.assertAllowedChannel(guild, message.channel.id, CHECKIN_CHANNEL)

            const checkin = await Checkin.getWaitingCheckin(client.prisma, 'link', message.url)
            const updatedCheckin = await Checkin.validateCheckin(client.prisma, flamewarden, checkin, Checkin.EMOJI_STATUS[emoji]) as CheckinType

            const member = await guild.members.fetch(checkin.user.discord_id)
            const newGrindRole = Checkin.getNewGrindRole(guild, updatedCheckin.checkin_streak!.streak)
            await Checkin.setMemberNewGrindRole(guild, member, newGrindRole)

            await Checkin.sendCheckinStatusToMember(flamewarden, member, updatedCheckin)
        }
        catch (err: any) {
            if (!(err instanceof DiscordBaseError))
                log.error(`Failed to handle: ${Checkin.ERR.UnexpectedSubmittedCheckinMessage}: ${err}`)
        }
    },
} as Event
