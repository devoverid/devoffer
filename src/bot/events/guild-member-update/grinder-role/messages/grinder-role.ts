import type { GuildMember } from 'discord.js'
import { CHECKIN_CHANNEL, FLAMEWARDEN_ROLE } from '@config/discord'
import { DiscordAssert } from '@utils/discord'

export class GrinderRoleMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        UnexpectedGrinderRole: '❌ Something went wrong while managing the grinder role',
    }

    static override readonly MSG = {
        ...DiscordAssert.MSG,
        Greetings: (member: GuildMember): string => `
# 🔥 A New Grinder Has Joined the Camp!
Welcome, <@${member.id}>✨ Your flame has been lit🔥
You’ve officially entered the Path of the Grinder.

Here’s what to do next:
1️⃣ Visit <#${CHECKIN_CHANNEL}> to begin your first daily grind.
2️⃣ Type what you’re working on. Whether coding, reading, creating, or learning.
3️⃣ Wait for a <@&${FLAMEWARDEN_ROLE}> to verify your check-in.

> Remember: your streak begins only when you check in!
> Fail to check in before 23:59 WIB, and your flame will fade.`,
    }
}
