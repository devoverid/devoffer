import { ChannelType, Guild, GuildMember, Interaction, PermissionFlagsBits, Role, TextChannel } from "discord.js"
import { EmbedRoleGrantModalError } from "../handlers/modal"
import { ERR, MSG } from "../messages"
import { EmbedRoleGrantButtonError } from "../handlers/button"
import { memberHasRole } from "@utils/discord"
import { decodeSnowflake } from "@utils/component"

export const assertModal = (modalId: string, id: string) => {
  if (!modalId.startsWith(id)) throw new EmbedRoleGrantModalError(ERR.InvalidModal)
}

export const assertButton = (buttonId: string, id: string) => {
  if (!buttonId.startsWith(id)) throw new EmbedRoleGrantButtonError(ERR.InvalidButton)
}

export const getModalCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildIdEnc, channelIdEnc, roleIdEnc, buttonNameEnc] = customId.split(":")
  const guildId = decodeSnowflake(guildIdEnc)
  const channelId = decodeSnowflake(channelIdEnc)
  const roleId = decodeSnowflake(roleIdEnc)
  const buttonName = decodeURIComponent(buttonNameEnc)

  if (!channelId) throw new EmbedRoleGrantModalError(ERR.ChannelNotFound)
  if (!roleId) throw new EmbedRoleGrantModalError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new EmbedRoleGrantModalError(ERR.NotGuild)
  return { prefix, guildId, channelId, roleId, buttonName }
}

export const getButtonCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildIdEnc, roleIdEnc] = customId.split(":")
  const guildId = decodeSnowflake(guildIdEnc)
  const roleId = decodeSnowflake(roleIdEnc)

  if (!guildId) throw new EmbedRoleGrantButtonError(ERR.GuildMissing)
  if (!roleId) throw new EmbedRoleGrantButtonError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new EmbedRoleGrantButtonError(ERR.NotGuild)

  return { prefix, guildId, roleId }
}

export const assertMember = (member: GuildMember) => {
  if (!member || !("roles" in member)) throw new EmbedRoleGrantButtonError(ERR.NoMember)
}

export const assertMemberHasRole = (member: GuildMember, role: Role) => {
  const hasRole = memberHasRole(member, role)
  if (hasRole) throw new EmbedRoleGrantButtonError(MSG.Revoked(role.id))
}

export const assertRoleManageable = (guild: Guild, bot: GuildMember, role: Role) => {
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) throw new EmbedRoleGrantModalError(ERR.NoManageRoles)
  if (role.managed || role.id === guild.roles.everyone.id) throw new EmbedRoleGrantModalError(ERR.RoleUneditable)
  if (bot.roles.highest.comparePositionTo(role) <= 0) throw new EmbedRoleGrantModalError(ERR.MemberAboveMe)
}

export const assertTextChannel = (channel: TextChannel) => {
  if (!channel || channel.type !== ChannelType.GuildText) throw new EmbedRoleGrantModalError(ERR.ChannelNotFound)
}

export const assertBotCanPost = (channel: TextChannel, me: GuildMember) => {
  const can = channel.permissionsFor(me)?.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ])
  if (!can) throw new EmbedRoleGrantModalError(ERR.CannotPost)
}

export const assertRole = (role: Role) => {
  if (!role) throw new EmbedRoleGrantModalError(ERR.RoleNotFound)
  if (!role.editable) throw new EmbedRoleGrantModalError(ERR.RoleUneditable)
}