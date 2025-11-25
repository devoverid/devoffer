import type { GrindRole } from '@config/discord'
import type { PrismaClient } from '@generatedDB/client'
import type { Checkin, CheckinStatusType } from '@type/checkin'
import type { EmbedBuilder, Guild, GuildMember } from 'discord.js'
import { AURA_FARMING_CHANNEL, CHECKIN_CHANNEL, FLAMEWARDEN_ROLE } from '@config/discord'
import { createEmbed } from '@utils/component'
import { DiscordAssert, getChannel, sendAsBot } from '@utils/discord'
import { attachNewGrindRole, getGrindRoleByStreakCount } from '@utils/discord/roles'
import { DUMMY } from '@utils/placeholder'
import { roleMention, userMention } from 'discord.js'
import { SubmittedCheckinError } from '../handlers/submitted-checkin'
import { SubmittedCheckinMessage } from '../messages/submitted-checkin'

export class SubmittedCheckin extends SubmittedCheckinMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
    ]

    static ALLOWED_EMOJI = ['❌', '🔥']

    static getNewGrindRole(guild: Guild, streakCount: number) {
        return getGrindRoleByStreakCount(guild.roles, streakCount)
    }

    static async setMemberNewGrindRole(
        guild: Guild,
        member: GuildMember,
        newRole?: GrindRole,
    ) {
        if (!newRole)
            return

        const channel = await getChannel(guild, AURA_FARMING_CHANNEL)
        const alreadyHasRole = member.roles.cache.has(newRole.id)

        if (!alreadyHasRole) {
            await attachNewGrindRole(member, newRole)
            await sendAsBot(null, channel, {
                content: `**Congratulations, ${userMention(member.id)}** ${SubmittedCheckin.MSG.ReachNewGrindRole(newRole)}`,
            })
        }
        else {
            const checkinChannel = await getChannel(guild, CHECKIN_CHANNEL)
            await sendAsBot(null, checkinChannel, {
                content: `Hey, ${userMention(member.id)}. You already have ${roleMention(newRole.id)}`,
            }, true)
        }
    }

    static assertFlamewardenMember(member: GuildMember) {
        const hasFlamewardenRole = this.isMemberHasRole(member, FLAMEWARDEN_ROLE)

        if (!hasFlamewardenRole)
            throw new SubmittedCheckinError(this.ERR.RoleMissing(FLAMEWARDEN_ROLE))
    }

    static assertEmojis(emoji: string | null | undefined) {
        if (!emoji || !this.ALLOWED_EMOJI.includes(emoji)) {
            throw new SubmittedCheckinError(this.ERR.UnexpectedEmoji)
        }
    }

    static async getCheckinByURL(prisma: PrismaClient, url: string) {
        const checkin = await prisma.checkin.findFirst({
            where: {
                link: url,
                status: 'WAITING',
                reviewed_by: null,
            },
            include: { user: true },
        })

        if (!checkin)
            throw new SubmittedCheckinError(this.ERR.PlainMessage)

        return checkin
    }

    static async validateCheckin(prisma: PrismaClient, member: GuildMember, checkin: Checkin, emoji: string | null): Promise<Checkin | undefined> {
        if (emoji === SubmittedCheckin.ALLOWED_EMOJI[0]) {
            return await SubmittedCheckin.updateCheckinStatus(prisma, member, checkin, 'REJECTED')
        }
        else if (emoji === SubmittedCheckin.ALLOWED_EMOJI[1]) {
            return await SubmittedCheckin.updateCheckinStatus(prisma, member, checkin, 'APPROVED')
        }
    }

    static async updateCheckinStatus(prisma: PrismaClient, member: GuildMember, checkin: Checkin, checkinStatus: CheckinStatusType): Promise<Checkin> {
        const updatedCheckin = await prisma.checkin.update({
            where: { id: checkin.id },
            data: {
                status: checkinStatus,
                reviewed_by: member.id,
                updated_at: new Date(),
                checkin_streak: {
                    update: {
                        streak: {
                            increment: checkinStatus === 'APPROVED' ? 1 : 0,
                        },
                        last_date: new Date(),
                        updated_at: new Date(),
                    },
                },
            },
            include: {
                checkin_streak: true,
            },
        })

        return updatedCheckin
    }

    static async sendCheckinStatusToMember(flamewarden: GuildMember, member: GuildMember, checkin: Checkin) {
        let embed: EmbedBuilder

        switch (checkin.status) {
            case 'REJECTED':
                embed = createEmbed(
                    `⚠️ Check-In Rejected`,
                    this.MSG.CheckinRejected(flamewarden, checkin),
                    '#D9534F',
                    { text: DUMMY.FOOTER },
                )
                break

            case 'APPROVED':
                embed = createEmbed(
                    `🔥 Check-In Approved`,
                    this.MSG.CheckinApproved(flamewarden, checkin),
                    '#4CAF50',
                    { text: DUMMY.FOOTER },
                )
                break

            default:
                throw new SubmittedCheckinError(this.ERR.UnknownCheckinStatus)
        }

        await member.send({ embeds: [embed] })
    }
}
