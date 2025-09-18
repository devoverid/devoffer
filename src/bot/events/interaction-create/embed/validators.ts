import { ChannelType, Guild, GuildMember, Interaction, PermissionFlagsBits, Role, TextChannel } from "discord.js"
import { ModalButtonCreateError } from "./modalButtonCreate"
import { ERR, MSG } from "./messages"
import { ButtonCreateError } from "./buttonCreate"
import { memberHasRole } from "../../../../utils/discord"

export const getModalCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildId, channelId, roleId, buttonNameEnc, colorEnc] = customId.split(":")
  if (!channelId) throw new ModalButtonCreateError(ERR.ChannelNotFound)
  if (!roleId) throw new ModalButtonCreateError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new ButtonCreateError(ERR.NotGuild)
  return { prefix, guildId, channelId, roleId, buttonNameEnc, colorEnc }
}

export const getButtonCustomId = (interaction: Interaction, customId: string) => {
  const [prefix, guildId, roleId] = customId.split(":")
  if (!guildId) throw new ButtonCreateError(ERR.GuildMissing)
  if (!roleId) throw new ButtonCreateError(ERR.RoleMissing)
  if (interaction.guildId !== guildId) throw new ButtonCreateError(ERR.NotGuild)

  return { prefix, guildId, roleId }
}

export const assertMember = (member: GuildMember) => {
  if (!member || !("roles" in member)) throw new ButtonCreateError(ERR.NoMember)
}

export const assertMemberHasRole = (member: GuildMember, role: Role) => {
  const hasRole = memberHasRole(member, role)
  if (hasRole) throw new ButtonCreateError(MSG.Revoked(role.id))
}

export const assertRoleManageable = (guild: Guild, bot: GuildMember, role: Role) => {
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) throw new ModalButtonCreateError(ERR.NoManageRoles)
  if (role.managed || role.id === guild.roles.everyone.id) throw new ModalButtonCreateError(ERR.RoleUneditable)
  if (bot.roles.highest.comparePositionTo(role) <= 0) throw new ModalButtonCreateError(ERR.MemberAboveMe)
}

export const assertTextChannel = (channel: TextChannel) => {
  if (!channel || channel.type !== ChannelType.GuildText) throw new ModalButtonCreateError(ERR.ChannelNotFound)
}

export const assertBotCanPost = (channel: TextChannel, me: GuildMember) => {
  const can = channel.permissionsFor(me)?.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ])
  if (!can) throw new ModalButtonCreateError(ERR.CannotPost)
}

export const assertRole = (role: Role) => {
  if (!role) throw new ModalButtonCreateError(ERR.RoleNotFound)
  if (!role.editable) throw new ModalButtonCreateError(ERR.RoleUneditable)
}