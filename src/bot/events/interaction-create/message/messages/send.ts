import { DiscordAssert } from '@utils/discord'

export class SendMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        UnexpectedSend: '❌ Something went wrong while sending the message',
    }
}
