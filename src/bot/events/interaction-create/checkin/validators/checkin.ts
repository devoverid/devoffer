import type { Prisma, PrismaClient } from '@generatedDB/client'
import type { Checkin as CheckinType } from '@type/checkin'
import type { CheckinStreak } from '@type/checkin-streak'
import type { User } from '@type/user'
import type { Attachment, GuildMember, Interaction } from 'discord.js'
import crypto from 'node:crypto'
import { CHECKIN_CHANNEL, GRINDER_ROLE } from '@config/discord'
import { decodeSnowflakes } from '@utils/component'
import { isDateToday, isDateYesterday } from '@utils/date'
import { DiscordAssert, getChannel } from '@utils/discord'
import { CheckinModalError } from '../handlers/checkin-modal'
import { CheckinMessage } from '../messages/checkin'

export class Checkin extends CheckinMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
    ]

    static override ATTACHMENT_COUNT: number = 1

    static PUBLIC_ID_PREFIX = 'CHK-'

    static getModalId(interaction: Interaction, customId: string) {
        const [prefix, guildId, tempToken] = decodeSnowflakes(customId)

        if (interaction.guildId !== guildId)
            throw new CheckinModalError(this.ERR.NotGuild)

        return { prefix, guildId, tempToken }
    }

    static generatePublicId(): string {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase()
        return `${this.PUBLIC_ID_PREFIX}${random}`
    }

    static async getPublicId(tx: Prisma.TransactionClient): Promise<string> {
        while (true) {
            const id = this.generatePublicId()
            const exists = await tx.checkin.findUnique({ where: { public_id: id } })

            if (!exists)
                return id
        }
    }

    static async assertAllowedChannel(interaction: Interaction) {
        const channel = await getChannel(interaction.guild!, CHECKIN_CHANNEL)
        this.assertMissPerms(interaction, channel)

        if (interaction.channelId !== CHECKIN_CHANNEL) {
            throw new CheckinModalError(this.ERR.AllowedCheckinChannel(channel))
        }
    }

    static assertCheckinToday(user: User) {
        const checkinStreakLastDate = user.checkin_streaks?.[0]?.last_date
        const checkinCreatedAt = user.checkins?.[0]?.created_at
        const isLastCheckinStreakToday = user.checkin_streaks?.length && (checkinStreakLastDate && isDateToday(checkinStreakLastDate))
        const isLastCheckinToday = user.checkins?.length && (checkinCreatedAt && isDateToday(checkinCreatedAt))

        if (isLastCheckinStreakToday || isLastCheckinToday)
            throw new CheckinModalError(this.ERR.AlreadyCheckinToday)
    }

    static assertMemberGrindRoles(member: GuildMember) {
        const hasGrinderRole = this.isMemberHasRole(member, GRINDER_ROLE)

        if (!hasGrinderRole)
            throw new CheckinModalError(this.ERR.RoleMissing(GRINDER_ROLE))
    }

    static async getOrCreateUser(prismaClient: PrismaClient, discordUserId: string): Promise<User> {
        const select = {
            id: true,
            discord_id: true,
            created_at: true,
            updated_at: true,
            checkin_streaks: {
                take: 1,
                orderBy: { first_date: 'desc' },
            },
            checkins: {
                orderBy: { created_at: 'desc' },
                take: 2,
            },
        } satisfies Prisma.UserSelect

        return prismaClient.user.upsert({
            where: { discord_id: discordUserId },
            create: { discord_id: discordUserId },
            update: {},
            select,
        })
    }

    static determineStreak(lastStreak: CheckinStreak | undefined) {
        if (!lastStreak)
            return 'new'

        if (!lastStreak.last_date)
            return 'new'

        if (!isDateYesterday(lastStreak.last_date))
            return 'new'

        return 'next'
    }

    static async upsertStreak(
        tx: Prisma.TransactionClient,
        userId: number,
        lastStreak: CheckinStreak | undefined,
        decision: 'new' | 'next',
    ): Promise<CheckinStreak> {
        if (decision === 'new') {
            return await tx.checkinStreak.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            })
        }
        else {
            return await tx.checkinStreak.update({
                where: { id: lastStreak!.id },
                data: { last_date: new Date() },
            })
        }
    }

    static async createCheckin(
        tx: Prisma.TransactionClient,
        userId: number,
        streak: CheckinStreak,
        description: string,
    ): Promise<CheckinType> {
        return await tx.checkin.create({
            data: {
                public_id: await this.getPublicId(tx),
                user_id: userId,
                checkin_streak_id: streak.id,
                description,
                status: 'WAITING',
            },
        })
    }

    static async getPrevCheckin(
        tx: Prisma.TransactionClient,
        userId: number,
        streak: CheckinStreak,
        checkin: CheckinType,
    ): Promise<CheckinType> {
        return await tx.checkin.findFirst({
            where: {
                user_id: userId,
                checkin_streak_id: streak.id,
                id: { not: checkin.id },
            },
            orderBy: { created_at: 'desc' },
        }) as CheckinType
    }

    static async createAttachments(
        tx: Prisma.TransactionClient,
        checkin: CheckinType,
        attachments?: Attachment[],
    ) {
        if (attachments?.length) {
            return await tx.attachment.createMany({
                data: attachments.map(a => ({
                    name: a.name,
                    url: a.url,
                    type: a.contentType ?? '',
                    size: a.size,
                    module_id: checkin.id,
                    module_type: 'CHECKIN',
                })),
            })
        }
    }

    static async validateCheckinStreak(
        prisma: PrismaClient,
        userId: number,
        lastCheckinStreak: CheckinStreak | undefined,
        description: string,
        attachments?: Attachment[] | undefined,
    ) {
        const decision = this.determineStreak(lastCheckinStreak)

        return prisma.$transaction(async (tx) => {
            const checkinStreak = await this.upsertStreak(tx, userId, lastCheckinStreak, decision)
            const checkin = await this.createCheckin(tx, userId, checkinStreak, description)
            const prevCheckin = await this.getPrevCheckin(tx, userId, checkinStreak, checkin)

            await this.createAttachments(tx, checkin, attachments)

            return {
                checkinStreak,
                checkin,
                prevCheckin,
            }
        })
    }

    static async updateCheckinMsgLink(prisma: PrismaClient, checkin: CheckinType, msgLink: string | null) {
        return prisma.checkin.update({
            where: { id: checkin.id },
            data: { link: msgLink },
        })
    }
}
