import type { Checkin } from '@type/checkin'
import type { GuildMember } from 'discord.js'
import { FLAMEWARDEN_ROLE, WARDEN_DUTY_CHANNEL } from '@config/discord'
import { getNow } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { DUMMY } from '@utils/placeholder'
import { roleMention, userMention } from 'discord.js'

export class CheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        AlreadyCheckinToday: (checkinMsgLink: string) => `❌ You already have a [check-in for today](${checkinMsgLink}). Please come back tomorrow`,
        UnexpectedCheckin: '❌ Something went wrong during check-in',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
        CheckinSuccess: (member: GuildMember, streakCount: number, todo: string, lastCheckin?: Checkin) => `
# ✅ New Check-In Detected!
*お願いいたします、${roleMention(FLAMEWARDEN_ROLE)}さん★ (kindly take a look at <#${WARDEN_DUTY_CHANNEL}>'s pin message about how to do verification upon a check-in)*

✨─────✨/✨━━━━✨
👤 **Grinder:** ${userMention(member.id)}
🕓 **Date:** ${getNow()}
🔥 **Current Streak:** ${++streakCount} day(s)
🗓 **Last Check-In:** ${lastCheckin ? lastCheckin.created_at.toLocaleString('id-ID') : '-'}
✰⋆｡:ﾟ･*☽:ﾟ･⋆｡✰⋆｡:ﾟ
${todo}

> ${DUMMY.FOOTER}`,
        CheckinSuccessToMember: (checkin: Checkin) => `
A new [check-in](${checkin.link}) has been submitted and is now waiting for verification.
🆔 **Check-In ID**: **\`${checkin.public_id}\`**
🗓 **Submitted At**: ${checkin.created_at.toLocaleString('id-ID')}

> 🔎 Pending review from Flamewarden; kindly wait`,
    }
}
