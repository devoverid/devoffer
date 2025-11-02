import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { getAttachments, getBotPerms, getMissPerms, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { Send } from '../validators/send'

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

    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            const message = interaction.options.getString('message') ?? ''
            const channel = interaction.channel as TextChannel
            const channelPerms = getBotPerms(interaction, channel)

            const attachments = getAttachments(interaction, Send.FILE_COUNT)
            const requiredPerms = Send.getPermsWithAttachments(attachments)
            const missedPerms = getMissPerms(channelPerms, requiredPerms)

            Send.assertMissPerms(missedPerms)

            await channel.send({
                content: message.length ? message : undefined,
                files: attachments.length ? attachments : undefined,
                allowedMentions: { parse: [] },
            })

            await sendReply(interaction, `✅ Message sent!`)
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${Send.ERR.UnexpectedSend}: ${err}`)
        }
    },
} as Command
