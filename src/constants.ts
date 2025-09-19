import { ChatInputCommandInteraction } from "discord.js"

export const CUSTOM_ID_SEPARATOR = ":"
export const ALPHABETS = "0123456789abcdefghijklmnopqrstuvwxyz"

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
