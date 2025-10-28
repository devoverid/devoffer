import type { GuildMember, RoleManager } from 'discord.js'
import { getGrindRoles } from '../config/roles'

export function getGrinderRoleByStreakCount(roleManager: RoleManager, streak_count: number) {
    const role = getGrindRoles(roleManager).find(role => streak_count === role.threshold)
    return role
}

export async function addMemberGrindRole(member: GuildMember, roleId: string) {
    return await member.roles.add(roleId)
}

export async function resetMemberGrindRoles(member: GuildMember) {
    await member.roles.remove(getGrindRoles().map(r => r.id))
}
