import type { Event } from '@events/event'
import type { Checkin as CheckinType } from '@type/checkin'
import type { Client, Interaction, TextChannel } from 'discord.js'
import { FLAMEWARDEN_ROLE } from '@config/discord'
import { EVENT_PATH } from '@events/index'
import { generateCustomId } from '@utils/component'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { Events } from 'discord.js'
import { Checkin } from '../validators/checkin'

export class CheckinApproveButtonError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('CheckinApproveButtonError', message, options)
    }
}

export const CHECKIN_APPROVE_BUTTON_ID = `${generateCustomId(EVENT_PATH, __filename)}-A`

export default {
    name: Events.InteractionCreate,
    desc: 'Handles check-in approve button interactions and approves user check-in.',
    async exec(client: Client, interaction: Interaction) {
        if (!interaction.isButton())
            return

        const isValidComponent = Checkin.assertComponentId(interaction.customId, CHECKIN_APPROVE_BUTTON_ID)
        if (!isValidComponent)
            return

        try {
            await interaction.deferUpdate()

            if (!interaction.inCachedGuild())
                throw new CheckinApproveButtonError(Checkin.ERR.NotGuild)

            const channel = interaction.channel as TextChannel
            Checkin.assertMissPerms(interaction, channel)

            const { checkinId } = Checkin.getButtonId(interaction, interaction.customId)
            const flamewarden = await interaction.guild.members.fetch(interaction.member.id)
            Checkin.assertMemberHasRole(flamewarden, FLAMEWARDEN_ROLE)

            const checkin = await Checkin.getCheckinById(client.prisma, checkinId)
            const updatedCheckin = await Checkin.validateCheckin(client.prisma, flamewarden, checkin, 'APPROVED') as CheckinType

            const member = await interaction.guild.members.fetch(checkin.user.discord_id)
            const newGrindRole = Checkin.getNewGrindRole(interaction.guild, updatedCheckin.checkin_streak!.streak)
            await Checkin.setMemberNewGrindRole(interaction.guild, member, newGrindRole)

            await Checkin.sendCheckinStatusToMember(flamewarden, member, updatedCheckin)
            await interaction.message.react('🔥')
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle ${CHECKIN_APPROVE_BUTTON_ID}: ${Checkin.ERR.UnexpectedButton}: ${err}`)
        }
    },
} as Event
