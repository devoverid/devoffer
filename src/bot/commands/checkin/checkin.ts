import { ChatInputCommandInteraction, GuildMember, GuildMemberRoleManager, MessageFlags, SlashCommandBuilder } from "discord.js"
import { Command } from ".."
import { increaseUserStreak } from "../../../db/queries/user"
import { prisma } from "../../../db/client"
import { createCheckin } from "../../../db/queries/checkin"
import { getYesterday, isDateToday } from "../../../utils/date"
import { FAILED_CHECKIN_ALREADY_CHECKIN_TODAY, generateFailedCheckinWrongChannelID } from "../../../constants"
import { addMemberRole, checkStreakCount, resetMemberRoles } from "../../../utils/roles"

export default {
  data: new SlashCommandBuilder()
    .setName("checkin")
    .setDescription("Daily grind check-in")
    .addStringOption(option => 
        option.setName("description")
            .setDescription("Check in description")
            .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id
    
    const allowedCheckinChannelId = process.env.CHECKIN_CHANNEL_ID!
    if (interaction.channelId !== allowedCheckinChannelId) {
        await interaction.reply({ content: generateFailedCheckinWrongChannelID(interaction, allowedCheckinChannelId), flags: MessageFlags.Ephemeral })
        return
    }

    let user = await interaction.client.prisma.user.findUnique({
        where: {
            discord_id
        },
        select: {
            id: true,
            streak_count: true,
            checkins: {
                take: 1,
                orderBy: {
                    created_at: 'desc'
                }
            }
        },
    })

    if (!user) {
        user = await interaction.client.prisma.user.create({
            data: {
                discord_id,
            },
            select: {
                id: true,
                streak_count: true,
                checkins: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        })

        // todo: create custom message for first time user
    }
    let streak_count = user.streak_count

    const yesterday = getYesterday()

    if (user.checkins.length == 0 || user.checkins[0].created_at < yesterday) {
        // reset streak count
        streak_count = 0
        resetMemberRoles(interaction.member! as GuildMember)
    }

    if (user.checkins.length && isDateToday(user.checkins[0].created_at)) {
        await interaction.reply({ content: FAILED_CHECKIN_ALREADY_CHECKIN_TODAY, flags: MessageFlags.Ephemeral });
        return
    }

    const description = interaction.options.getString("description")!

    // do the checkin
    const [_, updatedUser] = await prisma.$transaction([
        createCheckin(user.id, description),
        increaseUserStreak(user.id)
    ])

    streak_count = updatedUser.streak_count
    
    let newRole = checkStreakCount(streak_count)
    if (newRole) {
        await addMemberRole(interaction.member! as GuildMember, newRole.id)
    }


    const now = new Date()

    await interaction.reply({
        content: `**Check-in success!**\n
**Time:** ${now.toLocaleString('id-ID')}
**Your streak:** ${streak_count} days
**Description:**\n${description}`,
    })

    
  }
} as Command