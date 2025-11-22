import type { Checkin } from '@type/checkin'
import type { GuildMember, TextChannel } from 'discord.js'
import { FLAMEWARDEN_ROLE } from '@config/discord'
import { getNow } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { DUMMY } from '@utils/placeholder'
import { roleMention, userMention } from 'discord.js'

export class CheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        AllowedCheckinChannel: (channel: TextChannel) => `❌ You can't checkin on this channel. You need to go to ${channel}`,
        AlreadyCheckinToday: (checkinMsgLink: string) => `❌ You already have a [check-in for today](${checkinMsgLink}). Please come back tomorrow`,
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

> ${DUMMY.FOOTER}`,
        CheckinSuccessToUser: (checkin: Checkin) => `
A new [check-in](${checkin.link}) has been submitted and is now waiting for verification.
🆔 **Check-In ID**: **\`${checkin.public_id}\`**
🗓 **Submitted At**: ${checkin.created_at.toLocaleString('id-ID')}

Status:
> 🔎 Pending review from Flamewarden
`,
    }
}
