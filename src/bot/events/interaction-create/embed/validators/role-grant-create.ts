import type { Interaction } from 'discord.js'
import { decodeSnowflakes } from '@utils/component'
import { EmbedRoleGrantButtonError } from '../handlers/role-grant-create-button'
import { EmbedRoleGrantModalError } from '../handlers/role-grant-create-modal'
import { RoleGrantCreateMessage } from '../messages/role-grant-create'

export class RoleGrantCreate extends RoleGrantCreateMessage {
    static assertModal(modalId: string, id: string) {
        if (!modalId.startsWith(id))
            throw new EmbedRoleGrantModalError(this.ERR.InvalidModal)
    }

    static assertButton(buttonId: string, id: string) {
        if (!buttonId.startsWith(id))
            throw new EmbedRoleGrantButtonError(this.ERR.InvalidButton)
    }

    static getModalId(interaction: Interaction, customId: string) {
        const [prefix, guildId, channelId, roleId, buttonNameEnc] = decodeSnowflakes(customId)
        const buttonName = decodeURIComponent(buttonNameEnc)

        if (!channelId)
            throw new EmbedRoleGrantModalError(this.ERR.ChannelNotFound)
        if (!roleId)
            throw new EmbedRoleGrantModalError(this.ERR.RoleMissing(roleId))
        if (interaction.guildId !== guildId)
            throw new EmbedRoleGrantModalError(this.ERR.NotGuild)

        return { prefix, guildId, channelId, roleId, buttonName }
    }

    static getButtonId(interaction: Interaction, customId: string) {
        const [prefix, guildId, roleId] = decodeSnowflakes(customId)

        if (!guildId)
            throw new EmbedRoleGrantButtonError(this.ERR.GuildMissing)
        if (!roleId)
            throw new EmbedRoleGrantButtonError(this.ERR.RoleMissing(roleId))
        if (interaction.guildId !== guildId)
            throw new EmbedRoleGrantButtonError(this.ERR.NotGuild)

        return { prefix, guildId, roleId }
    }
}
