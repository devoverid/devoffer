import { GuildMember, GuildMemberRoleManager, Role } from "discord.js"
import { ROLES } from "../constants"

export const checkStreakCount = (streak_count: number) => {
    const role = ROLES.find((role) => streak_count == role.threshold)
    return role
}

export const addMemberRole = async (member: GuildMember, roleId: string) => {
    return await member.roles.add(roleId)
}

export const resetMemberRoles = async (member: GuildMember) => {
    await member.roles.remove(ROLES.map(r => r.id))
}