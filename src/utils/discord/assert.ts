import type { Guild, GuildMember, Role, TextChannel } from 'discord.js'
import { ChannelType, PermissionFlagsBits } from 'discord.js'
import { assertMemberHasRole } from '.'
import { DiscordBaseError } from './error'
import { DiscordMessage } from './message'

class DiscordAssertError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('DiscordAssertError', message, options)
    }
}

export class DiscordAssert extends DiscordMessage {
    static assertMember(member: GuildMember) {
        if (!member || !('roles' in member))
            throw new DiscordAssertError(this.ERR.NoMember)
    }

    static assertRoleManageable(guild: Guild, bot: GuildMember, role: Role) {
        if (!bot.permissions.has(PermissionFlagsBits.ManageRoles))
            throw new DiscordAssertError(this.ERR.NoManageRoles)
        if (role.managed || role.id === guild.roles.everyone.id)
            throw new DiscordAssertError(this.ERR.RoleUneditable)
        if (bot.roles.highest.comparePositionTo(role) <= 0)
            throw new DiscordAssertError(this.ERR.MemberAboveMe)
    }

    static assertChannel(channel: TextChannel) {
        if (!channel || channel.type !== ChannelType.GuildText)
            throw new DiscordAssertError(this.ERR.ChannelNotFound)
    }

    static assertBotCanPost(channel: TextChannel, me: GuildMember) {
        const can = channel.permissionsFor(me)?.has([
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
        ])
        if (!can)
            throw new DiscordAssertError(this.ERR.CannotPost)
    }

    static assertRole(role: Role) {
        if (!role)
            throw new DiscordAssertError(this.ERR.RoleNotFound)
        if (!role.editable)
            throw new DiscordAssertError(this.ERR.RoleUneditable)
    }

    static assertMemberHasRole(member: GuildMember, role: Role) {
        const hasRole = assertMemberHasRole(member, role)
        if (hasRole)
            throw new DiscordAssertError(this.roleRevoked(role.id))
    }
}
