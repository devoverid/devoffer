import { roleMention } from 'discord.js'

export class DiscordMessage {
    static readonly ERR = {
        NoMember: '❌ Couldn’t resolve your member record',
        NotGuild: '❌ This action must be used in a server',
        ChannelNotFound: '❌ Channel not found',
        NoManageRoles: '❌ I’m missing the **Manage Roles** permission',
        RoleUneditable: '❌ I can’t manage that role (check role hierarchy/managed role/@everyone)',
        MemberAboveMe: '❌ I can’t change roles for this member (their highest role is at/above mine)',
        RoleNotFound: '❌ Role not found',
        RoleMissing: '❌ The role no longer exists',
        GuildMissing: '❌ The guild could not be found',
        CannotPost: '❌ I can’t post in that channel',
    }

    static roleGranted(roleId: string): string {
        return `✅ Granted ${roleMention(roleId)} to you`
    }

    static roleRevoked(roleId: string): string {
        return `❌ You already have the ${roleMention(roleId)} role`
    }
}
