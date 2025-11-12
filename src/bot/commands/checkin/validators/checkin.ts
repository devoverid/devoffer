import type { GrindRole } from '@config/discord'
import type { PrismaClient } from '@generatedDB/client'
import type { User } from '@type/user'
import type { ChatInputCommandInteraction, Guild, GuildMember, Interaction } from 'discord.js'
import { AURA_FARMING_CHANNEL, CHECKIN_CHANNEL, GRINDER_ROLE } from '@config/discord'
import { isDateToday } from '@utils/date'
import { DiscordAssert, getChannel, sendAsBot } from '@utils/discord'
import { attachNewGrindRole, getGrindRoleByStreakCount } from '@utils/discord/roles'
import { userMention } from 'discord.js'
import { CheckinError } from '../handlers/checkin'
import { CheckinMessage } from '../messages/checkin'

export class Checkin extends CheckinMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
    ]

    static async assertAllowedChannel(interaction: Interaction) {
        const channel = await getChannel(interaction.guild!, CHECKIN_CHANNEL)
        this.assertMissPerms(interaction, channel)

        if (interaction.channelId !== CHECKIN_CHANNEL) {
            throw new CheckinError(this.ERR.AllowedCheckinChannel(channel))
        }
    }

    static assertCheckinToday(user: User) {
        if (user.checkins.length && isDateToday(user.checkins[0].created_at))
            throw new CheckinError(this.ERR.AlreadyCheckinToday)
    }

    static assertMemberGrindRoles(member: GuildMember) {
        const hasGrinderRole = this.isMemberHasRole(member, GRINDER_ROLE)

        if (!hasGrinderRole)
            throw new CheckinError(this.ERR.RoleMissing(GRINDER_ROLE))
    }

    static getNewGrindRole(guild: Guild, user: User) {
        return getGrindRoleByStreakCount(guild.roles, user.streak_count)
    }

    static async setMemberNewGrindRole(interaction: ChatInputCommandInteraction, member: GuildMember, newRole?: GrindRole) {
        if (newRole) {
            const channel = await getChannel(interaction.guild!, AURA_FARMING_CHANNEL)

            await attachNewGrindRole(member, newRole)
            await sendAsBot(interaction, AURA_FARMING_CHANNEL, { content: `
                **Congratulations, ${userMention(member.id)}** ${Checkin.MSG.ReachNewGrindRole(newRole)}
            ` })
        }
    }

    static async getOrCreateUser(prismaClient: PrismaClient, discordUserId: string): Promise<User> {
        const select = {
            id: true,
            streak_count: true,
            checkins: {
                take: 2,
                orderBy: {
                    created_at: 'desc' as const,
                },
            },
        }

        let user = await prismaClient.user.findUnique({
            where: { discord_id: discordUserId },
            select,
        }) as User

        if (!user) {
            user = await prismaClient.user.create({
                data: { discord_id: discordUserId },
                select,
            }) as User
        }

        return user
    }
}
