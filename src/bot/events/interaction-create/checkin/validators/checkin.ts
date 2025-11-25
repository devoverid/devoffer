import type { Prisma, PrismaClient } from '@generatedDB/client'
import type { Checkin as CheckinType } from '@type/checkin'
import type { CheckinStreak } from '@type/checkin-streak'
import type { User } from '@type/user'
import type { Attachment, GuildMember, Interaction } from 'discord.js'
import crypto from 'node:crypto'
import { GRINDER_ROLE } from '@config/discord'
import { createEmbed, decodeSnowflakes, encodeSnowflake, getCustomId } from '@utils/component'
import { isDateToday, isDateYesterday } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { DUMMY } from '@utils/placeholder'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { CHECKIN_APPROVE_BUTTON_ID, CHECKIN_CUSTOM_BUTTON_ID, CHECKIN_REJECT_BUTTON_ID, CheckinModalError } from '../handlers/checkin-modal'
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

    static generateButtons(guildId: string, checkinId: string): ActionRowBuilder<ButtonBuilder> {
        const approveButtonId = getCustomId([CHECKIN_APPROVE_BUTTON_ID, encodeSnowflake(guildId), encodeSnowflake(checkinId)])
        const approveButton = new ButtonBuilder()
            .setCustomId(approveButtonId)
            .setLabel('🔥 Approve')
            .setStyle(ButtonStyle.Success)

        const rejectButtonId = getCustomId([CHECKIN_REJECT_BUTTON_ID, encodeSnowflake(guildId), encodeSnowflake(checkinId)])
        const rejectButton = new ButtonBuilder()
            .setCustomId(rejectButtonId)
            .setLabel('🙅 Reject')
            .setStyle(ButtonStyle.Danger)

        const customButtonId = getCustomId([CHECKIN_CUSTOM_BUTTON_ID, encodeSnowflake(guildId), encodeSnowflake(checkinId)])
        const customButton = new ButtonBuilder()
            .setCustomId(customButtonId)
            .setLabel('⚙️ Review')
            .setStyle(ButtonStyle.Primary)

        return new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, rejectButton, customButton)
    }

    static assertCheckinToday(user: User) {
        const latestStreak = user.checkin_streaks?.[0]
        const latestCheckin = user.checkins?.[0]

        const streakWasToday = latestStreak?.last_date
            ? isDateToday(latestStreak.last_date)
            : false

        const checkinWasToday = latestCheckin?.created_at
            ? isDateToday(latestCheckin.created_at)
            : false

        const hasCheckedInToday = streakWasToday || checkinWasToday
        const checkinIsNonRejected = latestCheckin?.status && latestCheckin.status !== 'REJECTED'

        if (hasCheckedInToday && checkinIsNonRejected)
            throw new CheckinModalError(this.ERR.AlreadyCheckinToday(latestCheckin.link!))
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

        return this.isStreakContinuing(lastStreak.last_date) ? 'next' : 'new'
    }

    static isStreakContinuing(date: Date): boolean {
        return isDateToday(date) || isDateYesterday(date)
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

    static async updateCheckinMsgLink(prisma: PrismaClient, checkin: CheckinType, msgLink: string | null): Promise<CheckinType> {
        return prisma.checkin.update({
            where: { id: checkin.id },
            data: { link: msgLink },
        })
    }

    static async sendSuccessMessageToMember(member: GuildMember, checkin: CheckinType) {
        const embed = createEmbed(
            `🎉 Check-in Successful`,
            this.MSG.CheckinSuccessToMember(checkin),
            DUMMY.COLOR,
            { text: DUMMY.FOOTER },
        )

        await member.send({ embeds: [embed] })
    }
}
