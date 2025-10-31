import type { Attachment, ChatInputCommandInteraction, GuildMember, Interaction, InteractionReplyOptions, MessagePayload, Role, TextChannel } from 'discord.js'
import { MessageFlags } from 'discord.js'

export async function getChannel(interaction: Interaction, id: string): Promise<TextChannel> {
    return interaction.guild!.channels.cache.get(id) as TextChannel ?? await interaction.guild!.channels.fetch(id).then(channel => channel as TextChannel)
}

export async function getRole(interaction: Interaction, id: string): Promise<Role> {
    return interaction.guild!.roles.cache.get(id) as Role ?? await interaction.guild!.roles.fetch(id)
}

export async function getBot(interaction: Interaction): Promise<GuildMember> {
    return interaction.guild!.members.me as GuildMember ?? await interaction.guild!.members.fetchMe()
}

export const isMemberHasRole = (member: GuildMember, role: Role): boolean => member.roles.cache.has(role.id)

export function sendReply(interaction: Interaction, content: string, ephemeral: boolean = true) {
    if (!interaction.isRepliable())
        return

    const payloads: string | MessagePayload | InteractionReplyOptions = { content }
    if (ephemeral)
        payloads.flags = MessageFlags.Ephemeral

    if (interaction.replied || interaction.deferred)
        return interaction.followUp(payloads)

    return interaction.reply(payloads)
}

export function getAttachments(interaction: ChatInputCommandInteraction, fileCount: number): Attachment[] {
    const files: Attachment[] = []

    for (let i = 0; i <= fileCount; i++) {
        const file = interaction.options.getAttachment(`file${i}`)
        if (file)
            files.push(file)
    }

    return files
}

export * from './assert'
export * from './message'
