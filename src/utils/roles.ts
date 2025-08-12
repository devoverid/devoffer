import { GuildMember, RoleManager } from "discord.js"
import { getGrindRoles } from "../config/roles"

export const getGrinderRoleByStreakCount = (roleManager: RoleManager, streak_count: number) => {
    const role = getGrindRoles(roleManager).find((role) => streak_count == role.threshold)
    return role
}

export const addMemberGrindRole = async (member: GuildMember, roleId: string) => {
    return await member.roles.add(roleId)
}

export const resetMemberGrindRoles = async (member: GuildMember) => {
    await member.roles.remove(getGrindRoles().map(r => r.id))
}
