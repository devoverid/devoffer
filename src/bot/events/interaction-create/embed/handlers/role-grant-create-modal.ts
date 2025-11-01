import type { Event } from '@events/event'
import type { Interaction } from 'discord.js'
import { COMMAND_EMBED_ROLE_GRANT_CREATE_ID } from '@commands/embed/handlers/role-grant-create'
import { parseHexColor } from '@utils/color'
import { encodeSnowflake, getCustomId } from '@utils/component'
import { getBot, getChannel, getRole, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, roleMention } from 'discord.js'
import { RoleGrantCreate } from '../validators/role-grant-create'
import { EVENT_EMBED_ROLE_GRANT_CREATE_BUTTON_ID } from './role-grant-create-button'

export class EmbedRoleGrantModalError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('EmbedRoleGrantModalError', message, options)
    }
}

export default {
    name: Events.InteractionCreate,
    desc: 'Handles modal submissions for creating an embed with a role-grant button.',
    async exec(_, interaction: Interaction) {
        if (!interaction.isModalSubmit())
            return

        try {
            if (!interaction.inCachedGuild())
                throw new EmbedRoleGrantModalError(RoleGrantCreate.ERR.NotGuild)

            RoleGrantCreate.assertModal(interaction.customId, COMMAND_EMBED_ROLE_GRANT_CREATE_ID)

            const { channelId, roleId, buttonName } = RoleGrantCreate.getModalId(interaction, interaction.customId)
            const channel = await getChannel(interaction, channelId)
            RoleGrantCreate.assertChannel(channel)
            const role = await getRole(interaction, roleId)
            RoleGrantCreate.assertRole(role)
            const bot = await getBot(interaction)
            RoleGrantCreate.assertRoleManageable(interaction.guild, bot, role)
            RoleGrantCreate.assertBotCanPost(channel, bot)

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
                EVENT_EMBED_ROLE_GRANT_CREATE_BUTTON_ID,
                encodeSnowflake(interaction.guildId),
                encodeSnowflake(role.id),
            ])
            const button = new ButtonBuilder()
                .setCustomId(buttonCustomId)
                .setLabel(buttonName)
                .setStyle(ButtonStyle.Primary)

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
            const sent = await channel.send({ embeds: [embed], components: [row] })

            await sendReply(
                interaction,
                `✅ Posted in <#${channel.id}>. Clicking will add ${roleMention(role.id)}. [Jump](${sent.url})!`,
                false,
            )
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle ${COMMAND_EMBED_ROLE_GRANT_CREATE_ID}: ${RoleGrantCreate.ERR.UnexpectedModal}: ${err}`)
        }
    },
} as Event
