import { GuildMember, GuildMemberRoleManager, Role } from "discord.js"
import { GRIND_ROLES } from "../constants"

export const getGrinderRoleByStreakCount = (streak_count: number) => {
    const role = GRIND_ROLES.find((role) => streak_count == role.threshold)
    return role
}

export const addMemberGrindRole = async (member: GuildMember, roleId: string) => {
    return await member.roles.add(roleId)
}

export const resetMemberGrindRoles = async (member: GuildMember) => {
    await member.roles.remove(GRIND_ROLES.map(r => r.id))
}