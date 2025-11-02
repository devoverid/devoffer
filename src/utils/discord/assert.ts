import type { ChatInputCommandInteraction, Guild, GuildMember, Interaction, Role, TextChannel } from 'discord.js'
import { ChannelType, PermissionFlagsBits, PermissionsBitField } from 'discord.js'
import { getBotPerms, getMissPerms, isMemberHasRole } from '.'
import { DiscordBaseError } from './error'
import { DiscordMessage } from './message'

class DiscordAssertError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('DiscordAssertError', message, options)
    }
}

export class DiscordAssert extends DiscordMessage {
    static BASE_PERMS: bigint[] = [
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ViewChannel,
    ]

    static PERM_LABELS = new Map<bigint, string>(
        Object.entries(PermissionsBitField.Flags).map(([key, value]) => [
            value,
            key.replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase()),
        ]),
    )

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
        if (isMemberHasRole(member, role))
            throw new DiscordAssertError(this.roleRevoked(role.id))
    }

    static assertMissPerms(interaction: Interaction | ChatInputCommandInteraction, channel: TextChannel) {
        const channelPerms = getBotPerms(interaction, channel)
        const missedPerms = getMissPerms(channelPerms, this.BASE_PERMS)

        if (missedPerms.length) {
            const missingNames = missedPerms.map(p => this.PERM_LABELS.get(p) ?? 'Unknown Permission')

            throw new DiscordAssertError(this.ERR.RoleMissing(missingNames))
        }
    }
}
