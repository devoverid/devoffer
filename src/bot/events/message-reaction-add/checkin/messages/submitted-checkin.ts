import type { Checkin } from '@type/checkin'
import type { GuildMember } from 'discord.js'
import { DiscordAssert } from '@utils/discord'

export class SubmittedCheckinMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        UnknownCheckinStatus: '❌ The status for this check-in is unknown or unexpected.',
        UnexpectedSubmittedCheckinMessage: '❌ Something went wrong while submitting your check-in',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
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
