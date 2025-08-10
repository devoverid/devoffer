import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from ".."
import { increaseUserStreak } from "../../../db/queries/user"

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

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (user.checkins.length == 0 || user.checkins[0].created_at < yesterday) {
        // reset streak count
        streak_count = 0
    }

    const description = interaction.options.getString("description")!

    // do the checkin
    const result = await interaction.client.prisma.checkin.create({
        data: {
            user: {
                connect: {
                    id: user.id
                }
            },
            description,
        }
    })

    // update streak count
    await increaseUserStreak(user.id)

    await interaction.reply({
        content: `**Check-in success!**\n
**Time:** ${result.created_at.toLocaleString('id-ID')}
**Your streak:** ${streak_count} days
**Description:**\n${description}`,
    })

    
  }
} as Command