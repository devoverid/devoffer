import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction } from 'discord.js'
import { CHECKIN_CHANNEL } from '@config/discord'
import { CHECKIN_ID } from '@events/interaction-create/checkin/handlers/checkin-modal'
import { encodeSnowflake, getCustomId } from '@utils/component'
import { getAttachments, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { DUMMY } from '@utils/placeholder'
import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { Checkin } from '../../../events/interaction-create/checkin/validators/checkin'

export class CheckinError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('CheckinError', message, options)
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('checkin')
        .setDescription('Daily grind check-in.')
        .addAttachmentOption(opt =>
            opt.setName(`attachment-1`)
                .setDescription(`Attachment (optional)`)
                .setRequired(false),
        ),

    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new CheckinError(Checkin.ERR.NotGuild)

            const channel = await Checkin.assertAllowedChannel(interaction.guild, interaction.channelId, CHECKIN_CHANNEL)
            Checkin.assertMissPerms(interaction, channel)

            const attachments = getAttachments(interaction, Checkin.ATTACHMENT_COUNT)
            const tempToken = Checkin.setTempItem(attachments)

            const modalCustomId = getCustomId([
                CHECKIN_ID,
                encodeSnowflake(interaction.guildId),
                tempToken,
            ])

            const modal = new ModalBuilder()
                .setCustomId(modalCustomId)
                .setTitle('Daily Check-In')
            const messageInput = new TextInputBuilder()
                .setCustomId('todo')
                .setLabel('Kindly tell us what u have done ≽ > ⩊ < ≼ ')
                .setPlaceholder(DUMMY.DESC)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
            )

            await interaction.showModal(modal)
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle: ${Checkin.ERR.UnexpectedCheckin}: ${err}`)
        }
    },
} as Command
