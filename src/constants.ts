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
