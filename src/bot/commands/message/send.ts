import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { discordReply, getAttachments } from '@utils/discord'
import { formatList } from '@utils/text'
import { PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from 'discord.js'

const BASE_PERMS = [
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ViewChannel,
] as const

const PERM_LABELS = new Map<bigint, string>([
    [PermissionsBitField.Flags.SendMessages, 'Send Messages'],
    [PermissionsBitField.Flags.ViewChannel, 'View Channel'],
    [PermissionsBitField.Flags.AttachFiles, 'Attach Files'],
])

const FILE_COUNT = 5

export default {
    data: new SlashCommandBuilder()
        .setName('send-message')
        .setDescription('Send a message (optionally with attachments) as the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('Text to send.')
                .setRequired(false),
        )
        .addAttachmentOption(opt => opt.setName('attachment-1').setDescription('Attachment 1').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-2').setDescription('Attachment 2').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-3').setDescription('Attachment 3').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-4').setDescription('Attachment 4').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-5').setDescription('Attachment 5').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const content = interaction.options.getString('message') ?? ''
        const channel = interaction.channel as TextChannel
        const channelPerms = channel.permissionsFor(interaction.client.user!)!

        const attachments = getAttachments(interaction, FILE_COUNT)
        const requiredPerms = attachments.length ? [...BASE_PERMS, PermissionsBitField.Flags.AttachFiles] : [...BASE_PERMS]

        const missing = requiredPerms.filter(p => !channelPerms.has(p))
        if (missing.length) {
            const missingNames = missing.map(p => PERM_LABELS.get(p) ?? 'Unknown Permission')
            return await discordReply(
                interaction,
                `I’m missing **${formatList(missingNames)}** in this channel.`,
                true,
            )
        }

        const sent = await channel.send({
            content: content.length ? content : undefined,
            files: attachments.length ? attachments : undefined,
            allowedMentions: { parse: [] },
        })

        await discordReply(interaction, `✅ Sent! [Jump to message](${sent.url})`, true)
    },
} as Command
