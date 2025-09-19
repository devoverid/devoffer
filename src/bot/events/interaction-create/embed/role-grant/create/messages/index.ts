import { roleMention } from "discord.js";

export const ERR = {
  NoMember: "❌ Couldn’t resolve your member record.",
  NotGuild: "❌ This action must be used in a server.",
  NotModal: "❌ Not a modal submit interaction.",
  NotButton: "❌ Not a button interaction.",
  InvalidButton: "❌ Invalid custom ID. Not our button.",
  InvalidModal: "❌ Invalid custom ID. Not our modal.",
  ChannelNotFound: "❌ Channel not found.",
  NoManageRoles: "❌ I’m missing the **Manage Roles** permission.",
  RoleUneditable: "❌ I can’t manage that role (check role hierarchy / managed role / @everyone).",
  MemberAboveMe: "❌ I can’t change roles for this member (their highest role is at/above mine).",
  RoleNotFound: "❌ Role not found.",
  RoleMissing: "❌ The role no longer exists.",
  GuildMissing: "❌ The guild could not be found.",
  CannotPost: "❌ I can’t post in that channel.",
  UnexpectedModal: "❌ Something went wrong while handling the embed modal create.",
  UnexpectedButton: "❌ Something went wrong while handling the embed button button.",
} as const

export const MSG = {
  Granted: (roleId: string) => `✅ Granted ${roleMention(roleId)} to you.`,
  Revoked: (roleId: string) => `❌ You already have the ${roleMention(roleId)} role.`,
}