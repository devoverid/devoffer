import type { GrindRole } from '@config/discord'
import type { PrismaClient } from '@generatedDB/client'
import type { User } from '@type/user'
import type { ChatInputCommandInteraction, Guild, GuildMember, Interaction } from 'discord.js'
import { CHECKIN_CHANNEL, getGrindRoles, GRINDER_ROLE } from '@config/discord'
import { isDateToday } from '@utils/date'
import { getChannel, sendReply } from '@utils/discord'
import { attachNewGrindRole, getGrindRoleByStreakCount } from '@utils/discord/roles'
import { userMention } from 'discord.js'
import { CheckinError } from '../handlers/checkin'
import { CheckinMessage } from '../messages/checkin'

export class Checkin extends CheckinMessage {
    static async assertAllowedChannel(interaction: Interaction) {
        const channelId = CHECKIN_CHANNEL
        const channel = await getChannel(interaction, channelId)

        if (interaction.channelId !== channelId) {
            throw new CheckinError(this.ERR.AllowedCheckinChannel(channel))
        }
    }

    static assertCheckinToday(user: User) {
        if (user.checkins.length && isDateToday(user.checkins[0].created_at))
            throw new CheckinError(this.ERR.AlreadyCheckinToday)
    }

    static assertMemberGrindRoles(member: GuildMember) {
        const grindRoles = getGrindRoles().map(r => r.id)

        const hasGrinderRole = member.roles.cache.has(GRINDER_ROLE)
        const hasAnyGrindRole = grindRoles.some(roleId => member.roles.cache.has(roleId))

        if (!hasGrinderRole)
            throw new CheckinError(this.ERR.RoleMissing(GRINDER_ROLE))
        if (!hasAnyGrindRole)
            throw new CheckinError(this.ERR.RoleMissing(grindRoles[0]))
    }

    static getNewGrindRole(guild: Guild, user: User) {
        return getGrindRoleByStreakCount(guild.roles, user.streak_count)
    }

    static async setMemberNewGrindRole(interaction: ChatInputCommandInteraction, member: GuildMember, newRole?: GrindRole) {
        if (newRole) {
            await attachNewGrindRole(member, newRole)
            await sendReply(
                interaction,
                `**Congratulations, ${userMention(member.id)}** ${Checkin.MSG.ReachNewGrindRole(newRole)}`,
                false,
            )
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
