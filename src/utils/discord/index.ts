import type { Attachment, ChatInputCommandInteraction, Guild, GuildMember, Interaction, InteractionDeferReplyOptions, InteractionReplyOptions, MessageCreateOptions, PermissionsBitField, Role, TextChannel } from 'discord.js'
import { MessageFlags } from 'discord.js'

export async function getChannel(guild: Guild, id: string): Promise<TextChannel> {
    return guild!.channels.cache.get(id) as TextChannel ?? await guild!.channels.fetch(id).then(channel => channel as TextChannel)
}

export async function getRole(guild: Guild, id: string): Promise<Role> {
    return guild!.roles.cache.get(id) as Role ?? await guild!.roles.fetch(id)
}

export const getMissPerms = (channelPerms: Readonly<PermissionsBitField>, requiredPerms: bigint[]): bigint[] => requiredPerms.filter(p => !channelPerms.has(p))

export async function getBot(guild: Guild): Promise<GuildMember> {
    return guild!.members.me as GuildMember ?? await guild!.members.fetchMe()
}

export const getBotPerms = (interaction: Interaction, channel: TextChannel): Readonly<PermissionsBitField> => channel.permissionsFor(interaction.client.user!)!

export function getAttachments(interaction: ChatInputCommandInteraction, fileCount: number): Attachment[] {
    const files: Attachment[] = []

    for (let i = 0; i <= fileCount; i++) {
        const file = interaction.options.getAttachment(`attachment-${i}`)
        if (file)
            files.push(file)
    }

    return files
}

export async function sendReply(
    interaction: Interaction,
    content: string,
    ephemeral: boolean = true,
    payloads?: InteractionReplyOptions,
    isDeferred: boolean = false,
    isDeferEphemeral: boolean = false,
) {
    if (!interaction.isRepliable())
        return

    const opts: InteractionReplyOptions = { ...payloads, content }
    const deferOpts: InteractionDeferReplyOptions = {}

    if (ephemeral) {
        opts.flags = MessageFlags.Ephemeral
    }
    if (isDeferEphemeral) {
        deferOpts.flags = MessageFlags.Ephemeral
    }

    if (isDeferred)
        await interaction.deferReply(deferOpts)

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(opts)
    }
    else {
        await interaction.reply(opts)
    }
}

export async function sendAsBot(
    interaction: Interaction,
    channel: TextChannel | string,
    payloads: InteractionReplyOptions,
    isDeferred: boolean = false,
    isNextMessageEphemeral: boolean = false,
) {
    if (!interaction.isRepliable())
        return

    const { allowedMentions, components, content, embeds, files, poll, tts } = payloads
    const opts: MessageCreateOptions = { allowedMentions, components, content, embeds, files, poll, tts }
    const deferOpts: InteractionDeferReplyOptions = {}

    if (isNextMessageEphemeral)
        deferOpts.flags = MessageFlags.Ephemeral

    if (isDeferred)
        await interaction.deferReply(deferOpts)

    if (typeof channel === 'string')
        channel = await getChannel(interaction, channel)

    await channel.send(opts)
}

export * from './assert'
export * from './message'
