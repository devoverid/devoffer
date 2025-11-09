import type { Interaction } from 'discord.js'
import { decodeSnowflakes } from '@utils/component'
import { DiscordAssert } from '@utils/discord'
import { PermissionsBitField } from 'discord.js'
import { SendModalError } from '../handlers/send-modal'
import { SendMessage } from '../messages/send'

export class Send extends SendMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
        PermissionsBitField.Flags.AttachFiles,
    ]

    static FILE_COUNT: number = 5

    static getModalId(interaction: Interaction, customId: string) {
        const [prefix, guildId, channelId, tempToken] = decodeSnowflakes(customId)

        if (!channelId)
            throw new SendModalError(this.ERR.ChannelNotFound)
        if (interaction.guildId !== guildId)
            throw new SendModalError(this.ERR.NotGuild)

        return { prefix, guildId, channelId, tempToken }
    }
}
