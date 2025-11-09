import type { Event } from '@events/event'
import type { Interaction } from 'discord.js'
import { EVENT_PATH } from '@events/index'
import { parseHexColor } from '@utils/color'
import { encodeSnowflake, generateCustomId, getCustomId } from '@utils/component'
import { getChannel, getRole, sendAsBot, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, roleMention } from 'discord.js'
import { RoleGrantCreate } from '../validators/role-grant-create'
import { EMBED_ROLE_GRANT_CREATE_BUTTON_ID } from './role-grant-create-button'

export class EmbedRoleGrantModalError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('EmbedRoleGrantModalError', message, options)
    }
}

export const EMBED_ROLE_GRANT_CREATE_MODAL_ID = generateCustomId(EVENT_PATH, __filename)

export default {
    name: Events.InteractionCreate,
    desc: 'Handles modal submissions for creating an embed with a role-grant button.',
    async exec(_, interaction: Interaction) {
        if (!interaction.isModalSubmit())
            return

        const isValidComponent = RoleGrantCreate.assertComponentId(interaction.customId, EMBED_ROLE_GRANT_CREATE_MODAL_ID)
        if (!isValidComponent)
            return

        try {
            if (!interaction.inCachedGuild())
                throw new EmbedRoleGrantModalError(RoleGrantCreate.ERR.NotGuild)

            const { channelId, roleId, buttonName } = RoleGrantCreate.getModalId(interaction, interaction.customId)
            const channel = await getChannel(interaction, channelId)
            RoleGrantCreate.assertChannel(channel)
            const role = await getRole(interaction, roleId)
            RoleGrantCreate.assertRole(role)

            const title = interaction.fields.getTextInputValue('title')
            const description = interaction.fields.getTextInputValue('description')
            const color = parseHexColor(interaction.fields.getTextInputValue('color'))
            const footer = interaction.fields.getTextInputValue('footer')

            const embed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp(new Date())
            if (color)
                embed.setColor(color)
            if (footer)
                embed.setFooter({ text: footer })
            const buttonCustomId = getCustomId([
                EMBED_ROLE_GRANT_CREATE_BUTTON_ID,
                encodeSnowflake(interaction.guildId),
                encodeSnowflake(role.id),
            ])
            const button = new ButtonBuilder()
                .setCustomId(buttonCustomId)
                .setLabel(buttonName)
                .setStyle(ButtonStyle.Primary)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

            await sendAsBot(interaction, channel, { embeds: [embed], components: [row] })
            await sendReply(interaction, `✅ Posted! Clicking will add ${roleMention(role.id)} role~`)
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle ${EMBED_ROLE_GRANT_CREATE_MODAL_ID}: ${RoleGrantCreate.ERR.UnexpectedModal}: ${err}`)
        }
    },
} as Event
