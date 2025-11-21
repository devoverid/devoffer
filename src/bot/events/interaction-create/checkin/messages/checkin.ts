import type { Checkin } from '@type/checkin'
import type { GuildMember, TextChannel } from 'discord.js'
import { FLAMEWARDEN_ROLE } from '@config/discord'
import { getNow } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { roleMention, userMention } from 'discord.js'

export class CheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        AllowedCheckinChannel: (channel: TextChannel) => `❌ You can't checkin on this channel. You need to go to ${channel}`,
        AlreadyCheckinToday: '❌ You already have a check-in today. Please come back tomorrow',
        UnexpectedCheckin: '❌ Something went wrong during check-in',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
        CheckinSuccess: (member: GuildMember, streakCount: number, todo: string, lastCheckin?: Checkin) => `
# ✅ New Check-In Detected!
*お願いいたします、${roleMention(FLAMEWARDEN_ROLE)}さん★*
*Notes*:
🔹 ✅: *check-in approved*
🔹 ❌: *check-in rejected*

✨─────✨/✨━━━━✨
👤 **Grinder:** ${userMention(member.id)}
🕓 **Date:** ${getNow()}
🔥 **Current Streak:** ${++streakCount} day(s)
🗓 **Last Check-In:** ${lastCheckin ? lastCheckin.created_at.toLocaleString('id-ID') : '-'}
✰⋆｡:ﾟ･*☽:ﾟ･⋆｡✰⋆｡:ﾟ
${todo}

> DevOffer Check-In System • Keep your flame alive`,
    }
}
