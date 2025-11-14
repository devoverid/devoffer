import type { Event } from '@events/event'
import type { User } from '@type/user'
import type { Attachment, Client, GuildMember, Interaction } from 'discord.js'
import { createCheckin } from '@db/queries/checkin'
import { increaseUserStreak } from '@db/queries/user'
import { EVENT_PATH } from '@events/index'
import { generateCustomId, tempStore } from '@utils/component'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { Events } from 'discord.js'
import { Checkin } from '../validators/checkin'

export class CheckinModalError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('CheckinModalError', message, options)
    }
}

export const CHECKIN_ID = generateCustomId(EVENT_PATH, __filename)

export default {
    name: Events.InteractionCreate,
    desc: 'Handles modal submissions for check-in modal forms.',
    async exec(client: Client, interaction: Interaction) {
        if (!interaction.isModalSubmit())
            return

        const isValidComponent = Checkin.assertComponentId(interaction.customId, CHECKIN_ID)
        if (!isValidComponent)
            return

        try {
            if (!interaction.inCachedGuild())
                throw new CheckinModalError(Checkin.ERR.NotGuild)

            const { tempToken } = Checkin.getModalId(interaction, interaction.customId)
            const attachments = tempStore.get(tempToken) as Attachment[]
            Checkin.delTempItem(attachments, tempToken)

            const todo = interaction.fields.getTextInputValue('todo')
            const discordUserId: string = interaction.user.id
            const member = interaction.member as GuildMember
            const user = await Checkin.getOrCreateUser(client.prisma, discordUserId)

            await Checkin.assertAllowedChannel(interaction)
            Checkin.assertMember(member)
            Checkin.assertMemberGrindRoles(member)
            Checkin.assertCheckinToday(user)

            const [_, updatedUser] = await client.prisma.$transaction([
                createCheckin(user.id, todo),
                increaseUserStreak(user.id),
            ])

            const newGrindRole = Checkin.getNewGrindRole(interaction.guild, updatedUser as User)
            await Checkin.setMemberNewGrindRole(interaction, member, newGrindRole)

            await sendReply(
                interaction,
                Checkin.MSG.CheckinSuccess(
                    member,
                    updatedUser.streak_count,
                    todo,
                ),
                false,
                { files: attachments.length ? attachments : undefined },
                true,
            )
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle ${CHECKIN_ID}: ${Checkin.ERR.UnexpectedModal}: ${err}`)
        }
    },
} as Event
