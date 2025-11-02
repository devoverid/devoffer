import type { Attachment } from 'discord.js'
import { DiscordAssert } from '@utils/discord'
import { PermissionsBitField } from 'discord.js'
import { SendMessage } from '../messages/send'

export class Send extends SendMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
        PermissionsBitField.Flags.AttachFiles,
    ]

    static FILE_COUNT: number = 5

    static getPermsWithAttachments(attachments: Attachment[]) {
        if (!attachments.length)
            return this.BASE_PERMS.filter(p => p !== PermissionsBitField.Flags.AttachFiles)

        return this.BASE_PERMS
    }
}
