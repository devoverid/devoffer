import { ChannelType, Guild, GuildMember, Interaction, PermissionFlagsBits, Role, TextChannel } from "discord.js"
import { RoleGrantModalError } from "../components/modal"
import { ERR, MSG } from "../messages"
import { RoleGrantButtonError } from "../components/button"
import { memberHasRole } from "../../../../../../../utils/discord"
import { parseHexColor } from "../../../../../../../utils/color"

export const getModalCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildId, channelId, roleId, buttonNameEnc, colorEnc] = customId.split(":")
  const buttonName = decodeURIComponent(buttonNameEnc)
  const color = parseHexColor(decodeURIComponent(colorEnc))

  if (!channelId) throw new RoleGrantModalError(ERR.ChannelNotFound)
  if (!roleId) throw new RoleGrantModalError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new RoleGrantModalError(ERR.NotGuild)
  return { prefix, guildId, channelId, roleId, buttonName, color }
}

export const getButtonCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildId, roleId] = customId.split(":")
  if (!guildId) throw new RoleGrantButtonError(ERR.GuildMissing)
  if (!roleId) throw new RoleGrantButtonError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new RoleGrantButtonError(ERR.NotGuild)

  return { prefix, guildId, roleId }
}

export const assertMember = (member: GuildMember) => {
  if (!member || !("roles" in member)) throw new RoleGrantButtonError(ERR.NoMember)
}

export const assertMemberHasRole = (member: GuildMember, role: Role) => {
  const hasRole = memberHasRole(member, role)
  if (hasRole) throw new RoleGrantButtonError(MSG.Revoked(role.id))
}

export const assertRoleManageable = (guild: Guild, bot: GuildMember, role: Role) => {
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) throw new RoleGrantModalError(ERR.NoManageRoles)
  if (role.managed || role.id === guild.roles.everyone.id) throw new RoleGrantModalError(ERR.RoleUneditable)
  if (bot.roles.highest.comparePositionTo(role) <= 0) throw new RoleGrantModalError(ERR.MemberAboveMe)
}

export const assertTextChannel = (channel: TextChannel) => {
  if (!channel || channel.type !== ChannelType.GuildText) throw new RoleGrantModalError(ERR.ChannelNotFound)
}

export const assertBotCanPost = (channel: TextChannel, me: GuildMember) => {
  const can = channel.permissionsFor(me)?.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ])
  if (!can) throw new RoleGrantModalError(ERR.CannotPost)
}

export const assertRole = (role: Role) => {
  if (!role) throw new RoleGrantModalError(ERR.RoleNotFound)
  if (!role.editable) throw new RoleGrantModalError(ERR.RoleUneditable)
}