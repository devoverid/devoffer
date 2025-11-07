import type { Command } from '@commands/command'
import type { User } from '@type/user'
import type { ChatInputCommandInteraction, Client, GuildMember, TextChannel } from 'discord.js'
import { createCheckin } from '@db/queries/checkin'
import { increaseUserStreak } from '@db/queries/user'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { SlashCommandBuilder } from 'discord.js'
import { Checkin } from '../validators/checkin'

export class CheckinError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('CheckinError', message, options)
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('checkin')
        .setDescription('Daily grind check-in.')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Check in description.')
                .setRequired(true),
        ),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new CheckinError(Checkin.ERR.NotGuild)

            const description = interaction.options.getString('description', true)
            const channel = interaction.channel as TextChannel
            Checkin.assertMissPerms(interaction, channel)

            const discordUserId: string = interaction.user.id
            const member = interaction.member as GuildMember
            const user = await Checkin.getOrCreateUser(client.prisma, discordUserId)

            await Checkin.assertAllowedChannel(interaction)
            Checkin.assertMember(member)
            Checkin.assertMemberGrindRoles(member)
            Checkin.assertCheckinToday(user)

            const [_, updatedUser] = await client.prisma.$transaction([
                createCheckin(user.id, description),
                increaseUserStreak(user.id),
            ])

            const newGrindRole = Checkin.getNewGrindRole(interaction.guild, updatedUser as User)
            await Checkin.setMemberNewGrindRole(interaction, member, newGrindRole)

            await sendReply(
                interaction,
                Checkin.MSG.CheckinSuccess(
                    member,
                    updatedUser.streak_count,
                    description,
                ),
                false,
            )
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${Checkin.ERR.UnexpectedCheckin}: ${err}`)
        }
    },
} as Command
