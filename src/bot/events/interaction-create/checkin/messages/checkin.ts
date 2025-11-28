import type { Checkin } from '@type/checkin'
import type { GuildMember } from 'discord.js'
import { FLAMEWARDEN_ROLE } from '@config/discord'
import { getNow } from '@utils/date'
import { DiscordAssert } from '@utils/discord'
import { DUMMY } from '@utils/placeholder'

export class CheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        AlreadyCheckinToday: (checkinMsgLink: string) => `❌ You already have a [check-in for today](${checkinMsgLink}). Please come back tomorrow`,
        SubmittedCheckinNotToday: (checkinMsgLink: string) => `❌ This [submitted check-in](${checkinMsgLink})'s date should equals as today. You can't review this anymore`,
        CheckinIdMissing: '❌ Check-in ID is missing or invalid',
        CheckinIdInvalid: '❌ The provided check-in ID is invalid',
        UnknownCheckinStatus: '❌ The status for this check-in is unknown or unexpected.',
        UnexpectedSubmittedCheckinMessage: '❌ Something went wrong while submitting your check-in',
        UnexpectedCheckin: '❌ Something went wrong during check-in',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
        CheckinSuccess: (member: GuildMember, streakCount: number, todo: string, lastCheckin?: Checkin) => `
# ✅ New Check-In Detected!
*お願いいたします、<@&${FLAMEWARDEN_ROLE}>さん★

✨─────✨/✨━━━━✨
👤 **Grinder:** <@${member.id}>
🕓 **Date:** ${getNow()}
🔥 **Current Streak:** ${streakCount} day(s)
🗓 **Last Check-In:** ${lastCheckin ? lastCheckin.created_at.toLocaleString('id-ID') : '-'}
✰⋆｡:ﾟ･*☽:ﾟ･⋆｡✰⋆｡:ﾟ
${todo}

> ${DUMMY.FOOTER}`,

        CheckinSuccessToMember: (checkin: Checkin) => `
A new [check-in](${checkin.link}) has been submitted and is now waiting for verification.
🆔 **Check-In ID**: **\`${checkin.public_id}\`**
🗓 **Submitted At**: ${checkin.created_at.toLocaleString('id-ID')}

> 🔎 Pending review from Flamewarden; kindly wait`,

        CheckinApproved: (flamewarden: GuildMember, checkin: Checkin) => `
Your [flame](${checkin.link}) burns brighter today.
🆔 **Check-In ID**: **\`${checkin.public_id}\`**
🔥 **Current Streak**: ${checkin.checkin_streak!.streak}
🗓 **Approved At**: ${checkin.updated_at!.toLocaleString('id-ID')}
👀 **Approved By**: ${flamewarden.displayName} (@${flamewarden.user.username})
✍🏻 **${flamewarden.displayName}'(s) Comment**: ${checkin.comment ?? '-'}

> 🔥 Consistency fuels the fire; keep going`,

        CheckinRejected: (flamewarden: GuildMember, checkin: Checkin) => `
This [check-in](${checkin.link}) didn’t meet the requirements and has been rejected.
🆔 **Check-In ID**: **\`${checkin.public_id}\`**
🔥 **Current Streak**: ${checkin.checkin_streak!.streak}
🗓 **Reviewed At**: ${checkin.updated_at!.toLocaleString('id-ID')}
👀 **Reviewed By**: ${flamewarden.displayName} (@${flamewarden.user.username})
✍🏻 **${flamewarden.displayName}'(s) Comment**: ${checkin.comment ?? '-'}

> 🧯 Your flame flickered, but it hasn’t gone out yet; try again`,
    }
}
