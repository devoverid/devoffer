import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { MESSAGE_SEND_ID } from '@events/interaction-create/message/handlers/send-modal'
import { encodeSnowflake, getCustomId } from '@utils/component'
import { getAttachments, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { DUMMY } from '@utils/placeholder'
import { ActionRowBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { Send } from '../../../events/interaction-create/message/validators/send'

export class SendError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('SendError', message, options)
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('send-message')
        .setDescription('Send a message (optionally with attachments) as the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addAttachmentOption(opt => opt.setName('attachment-1').setDescription('Attachment 1').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-2').setDescription('Attachment 2').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-3').setDescription('Attachment 3').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-4').setDescription('Attachment 4').setRequired(false))
        .addAttachmentOption(opt => opt.setName('attachment-5').setDescription('Attachment 5').setRequired(false)),

    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new SendError(Send.ERR.NotGuild)

            const channel = interaction.channel as TextChannel
            Send.assertMissPerms(interaction, channel)

            const attachments = getAttachments(interaction, Send.FILE_COUNT)
            const tempToken = Send.setTempItem(attachments)

            const modalCustomId = getCustomId([
                MESSAGE_SEND_ID,
                encodeSnowflake(interaction.guildId!),
                encodeSnowflake(channel.id),
                tempToken,
            ])
            const modal = new ModalBuilder()
                .setCustomId(modalCustomId)
                .setTitle('Send a Message as Bot')
            const messageInput = new TextInputBuilder()
                .setCustomId('message')
                .setLabel('Message')
                .setPlaceholder(DUMMY.DESC)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
            )

            await interaction.showModal(modal)
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${Send.ERR.UnexpectedSend}: ${err}`)
        }
    },
} as Command
