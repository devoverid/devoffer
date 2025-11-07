import type { Command } from '@commands/command'
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { COMMAND_PATH } from '@commands/index'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders'
import { RoleGrantCreate } from '@events/interaction-create/embed/validators/role-grant-create'
import { encodeSnowflake, generateCustomId, getCustomId } from '@utils/component'
import { sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { DUMMY } from '@utils/placeholder'
import { PermissionFlagsBits, SlashCommandBuilder, TextInputStyle } from 'discord.js'

export class EmbedRoleGrantError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('EmbedRoleGrantError', message, options)
    }
}

export const COMMAND_EMBED_ROLE_GRANT_CREATE_ID = generateCustomId(COMMAND_PATH, __filename)

export default {
    data: new SlashCommandBuilder()
        .setName('create-embed-role-grant')
        .setDescription('Create an embed in a channel w/ a role-grant button.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addRoleOption(opt => opt.setName('role').setDescription('Role to grant.').setRequired(true))
        .addStringOption(opt => opt.setName('button-name').setDescription('Text to display on the button-make it catchy.').setRequired(true)),

    async execute(_, interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.inCachedGuild())
                throw new EmbedRoleGrantError(RoleGrantCreate.ERR.NotGuild)

            const channel = interaction.channel as TextChannel
            RoleGrantCreate.assertMissPerms(interaction, channel)

            const buttonName = interaction.options.getString('button-name', true)
            const role = interaction.options.getRole('role', true)

            const modalCustomId = getCustomId([
                COMMAND_EMBED_ROLE_GRANT_CREATE_ID,
                encodeSnowflake(interaction.guildId!),
                encodeSnowflake(channel.id),
                encodeSnowflake(role.id),
                encodeURIComponent(buttonName),
            ])
            const modal = new ModalBuilder()
                .setCustomId(modalCustomId)
                .setTitle('Create Embed with Role-Grant Button')
            const titleInput = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Title')
                .setPlaceholder(DUMMY.TITLE)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(256)
                .setRequired(true)
            const descInput = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Description')
                .setPlaceholder(DUMMY.DESC)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            const colorInput = new TextInputBuilder()
                .setCustomId('color')
                .setLabel('Color (optional)')
                .setPlaceholder(DUMMY.COLOR)
                .setValue(DUMMY.COLOR)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            const footerInput = new TextInputBuilder()
                .setCustomId('footer')
                .setLabel('Footer (optional)')
                .setPlaceholder(DUMMY.FOOTER)
                .setValue(DUMMY.FOOTER)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput),
            )

            await interaction.showModal(modal)
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                sendReply(interaction, err.message)
            else log.error(`Failed to handle ${COMMAND_EMBED_ROLE_GRANT_CREATE_ID}: ${RoleGrantCreate.ERR.UnexpectedRoleGrantCreate}: ${err}`)
        }
    },
} as Command
