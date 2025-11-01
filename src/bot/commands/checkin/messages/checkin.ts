import type { GuildMember, TextChannel } from 'discord.js'
import { FLAMEWARDEN_ROLE } from '@config/discord'
import { getNow } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { roleMention, userMention } from 'discord.js'

export class CheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        UnexpectedCheckin: '❌ Something went wrong during check-in',
        AllowedCheckinChannel: (channel: TextChannel) => `❌ You can't checkin on this channel. You need to go to ${channel}`,
        AlreadyCheckinToday: '❌ You have already checked in today. Please come back tomorrow',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
        CheckinSuccess: (member: GuildMember, streakCount: number, desc: string) => `
# ✅ New Check-In Detected!
*お願いいたします、${roleMention(FLAMEWARDEN_ROLE)}さん★*
*Notes*:
🔹 ✅: *check-in approved*
🔹 ❌: *check-in rejected*

✨─────✨/✨━━━━✨
👤 **Grinder:** ${userMention(member.id)}
🕓 **Date:** ${getNow()}
🔥 **Current Streak:** ${streakCount} day(s)
🗓 **Last Check-In:** ?
📝 **Activity Description:**
${desc}
✰⋆｡:ﾟ･*☽:ﾟ･⋆｡✰⋆｡:ﾟ

> DevOffer Check-In System • Keep your flame alive`,
    }
}
