import { DiscordAssert } from '@utils/discord'
import { PermissionsBitField } from 'discord.js'
import { SendMessage } from '../messages/send'

export class Send extends SendMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
        PermissionsBitField.Flags.AttachFiles,
    ]

    static FILE_COUNT: number = 5
}
