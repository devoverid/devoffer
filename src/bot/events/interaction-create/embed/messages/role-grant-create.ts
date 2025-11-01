import { DiscordAssert } from '@utils/discord'

export class RoleGrantCreateMessage extends DiscordAssert {
    static override readonly ERR = {
        ...DiscordAssert.ERR,
        NotModal: '❌ Not a modal submit interaction',
        NotButton: '❌ Not a button interaction',
        InvalidButton: '❌ Invalid custom ID. Not our button',
        InvalidModal: '❌ Invalid custom ID. Not our modal',
        UnexpectedModal: '❌ Something went wrong while handling the embed modal create',
        UnexpectedButton: '❌ Something went wrong while handling the embed button button',
    }
}
