import { GuildMember, Interaction, InteractionReplyOptions, MessageFlags, MessagePayload, Role, TextChannel } from "discord.js";

export const getDiscordChannel = async (interaction: Interaction, id: string): Promise<TextChannel> =>
  interaction.guild!.channels.cache.get(id) as TextChannel ?? await interaction.guild!.channels.fetch(id).then(channel => channel as TextChannel)

export const getDiscordRole = async (interaction: Interaction, id: string): Promise<Role> =>
  interaction.guild!.roles.cache.get(id) as Role ?? await interaction.guild!.roles.fetch(id)

export const getDiscordBot = async (interaction: Interaction): Promise<GuildMember> =>
  interaction.guild!.members.me as GuildMember ?? await interaction.guild!.members.fetchMe()

export const memberHasRole = (member: GuildMember, role: Role): boolean => member.roles.cache.has(role.id)

export const discordReply = (interaction: Interaction, content: string, ephemeral: boolean = true) => {
  if (!interaction.isRepliable()) return
  const payloads: string | MessagePayload | InteractionReplyOptions = { content }
  if (ephemeral) payloads.flags = MessageFlags.Ephemeral

  if (interaction.replied) return interaction.followUp(payloads)
  return interaction.reply(payloads)
}