import { ChatInputCommandInteraction } from "discord.js"

export const FAILED_CHECKIN_ALREADY_CHECKIN_TODAY = `**Check-in failed**\n
You already did checkin today\n
Come back tomorrow`

export function generateFailedCheckinWrongChannelID(interaction: ChatInputCommandInteraction, allowedCheckinChannelId: string): string {
    return `**Check-in failed**\n
You can't checkin on this channel\n
You need to go to ${interaction.guild?.channels.cache.get(allowedCheckinChannelId)}!
`
}

export const checkinSuccessMessage = (streak_count: number, description: string, congratsMessage: string) => {
    const now = new Date()
    return `**Check-in success!**\n
**Time:** ${now.toLocaleString('id-ID')}
**Your streak:** ${streak_count} days
**Description:**\n${description}${congratsMessage}`
}

export const advanceRoleMessage = (role: string) => {
    return `\n\n**Congratulations!**\nYou have reached ${role}! :tada:`
}

export const GRIND_ROLES = [
    {
        name: "Flameborn",
        id: "1403320928519327755",
        threshold: 1,
    },
    {
        name: "Fire Awakened",
        id: "1403320958202282047",
        threshold: 7,
    },
    {
        name: "Ember Ignited",
        id: "1403321016406638674",
        threshold: 30,
    },
    {
        name: "Blaze Seeker",
        id: "1403322168841994340",
        threshold: 90,
    },
    {
        name: "Inferno Bound",
        id: "1403321040448258138",
        threshold: 180,
    },
    {
        name: "Everburning",
        id: "1403321099688607774",
        threshold: 270,
    },
    {
        name: "Eternal Fyre",
        id: "1403321123331899402",
        threshold: 364,
    },
]
