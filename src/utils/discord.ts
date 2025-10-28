import type { GuildMember, Interaction, InteractionReplyOptions, MessagePayload, Role, TextChannel } from 'discord.js'
import { MessageFlags } from 'discord.js'

export async function getDiscordChannel(interaction: Interaction, id: string): Promise<TextChannel> {
    return interaction.guild!.channels.cache.get(id) as TextChannel ?? await interaction.guild!.channels.fetch(id).then(channel => channel as TextChannel)
}

export async function getDiscordRole(interaction: Interaction, id: string): Promise<Role> {
    return interaction.guild!.roles.cache.get(id) as Role ?? await interaction.guild!.roles.fetch(id)
}

export async function getDiscordBot(interaction: Interaction): Promise<GuildMember> {
    return interaction.guild!.members.me as GuildMember ?? await interaction.guild!.members.fetchMe()
}

export const memberHasRole = (member: GuildMember, role: Role): boolean => member.roles.cache.has(role.id)

export function discordReply(interaction: Interaction, content: string, ephemeral: boolean = true) {
    if (!interaction.isRepliable())
        return

    const payloads: string | MessagePayload | InteractionReplyOptions = { content }
    if (ephemeral)
        payloads.flags = MessageFlags.Ephemeral

    if (interaction.replied)
        return interaction.followUp(payloads)

    return interaction.reply(payloads)
}
