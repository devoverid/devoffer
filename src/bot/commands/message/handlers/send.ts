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

const data = new SlashCommandBuilder()
    .setName('send-message')
    .setDescription('Send a message (optionally with attachments) as the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

for (let i = 1; i <= Send.ATTACHMENT_COUNT; i++) {
    data.addAttachmentOption(opt =>
        opt
            .setName(`attachment-${i}`)
            .setDescription(`Attachment ${i} (optional)`)
            .setRequired(false),
    )
}

export default {
    data,
    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new SendError(Send.ERR.NotGuild)

            const channel = interaction.channel as TextChannel
            Send.assertMissPerms(interaction, channel)

            const attachments = getAttachments(interaction, Send.ATTACHMENT_COUNT)
            const tempToken = Send.setTempItem(attachments)

            const modalCustomId = getCustomId([
                MESSAGE_SEND_ID,
                encodeSnowflake(interaction.guildId),
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
