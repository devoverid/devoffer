import type { GrindRole } from '@config/discord'
import { roleMention } from 'discord.js'

export class DiscordMessage {
    static readonly ERR = {
        NoMember: '❌ Couldn’t resolve your member record',
        NotGuild: '❌ This action must be used in a server',
        ChannelNotFound: '❌ Channel not found',
        NoManageRoles: '❌ I’m missing the **Manage Roles** permission',
        RoleUneditable: '❌ I can’t manage that role (check role hierarchy/managed role/@everyone)',
        MemberAboveMe: '❌ I can’t change roles for this member (their highest role is at/above mine)',
        RoleNotFound: '❌ The role no longer exists',
        RoleMissing(roleId: string) {
            return `❌ Missing role: ${roleMention(roleId)}`
        },
        GuildMissing: '❌ The guild could not be found',
        CannotPost: '❌ I can’t post in that channel',
    }

    static readonly MSG = {
        ReachNewGrindRole(role: GrindRole) {
            return `🎉 You have reached a new grind role: ${roleMention(role.id)}~`
        },
    }

    static roleGranted(roleId: string): string {
        return `✅ Granted ${roleMention(roleId)} to you`
    }

    static roleRevoked(roleId: string): string {
        return `❌ You already have the ${roleMention(roleId)} role`
    }
}
