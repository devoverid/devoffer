import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Interaction, roleMention } from "discord.js"
import { Event } from "../../event"
import { parseHexColor } from "../../../../utils/color"
import { COMMAND_EMBED_BUTTON_CREATE_ID } from "../../../commands/embed/buttonCreate"
import { discordReply, getDiscordBot, getDiscordChannel, getDiscordRole } from "../../../../utils/discord"
import { EVENT_EMBED_BUTTON_CREATE_ID } from "./buttonCreate"
import { log } from "../../../../utils/logger"
import { ERR } from "./messages"
import { assertBotCanPost, assertRole, assertRoleManageable, assertTextChannel, getModalCustomId } from "./validators"

export class ModalButtonCreateError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ModalButtonCreateError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default {
  name: Events.InteractionCreate,
  desc: "Handles modal submissions for creating an embed with a role-grant button.",
  async exec(_, interaction: Interaction) {
    if (!interaction.isModalSubmit()) return
    if (!interaction.inCachedGuild()) throw new ModalButtonCreateError(ERR.NotGuild)
    if (!interaction.customId.startsWith(COMMAND_EMBED_BUTTON_CREATE_ID)) throw new ModalButtonCreateError(ERR.InvalidModal)

    try {
      const { channelId, roleId, buttonNameEnc, colorEnc } = getModalCustomId(interaction, interaction.customId)

      const channel = await getDiscordChannel(interaction, channelId)
      assertTextChannel(channel)

      const role = await getDiscordRole(interaction, roleId)
      assertRole(role)

      const bot = await getDiscordBot(interaction)
      assertRoleManageable(interaction.guild, bot, role)
      assertBotCanPost(channel, bot)

      const title = interaction.fields.getTextInputValue("title")
      const description = interaction.fields.getTextInputValue("description")
      const buttonName = decodeURIComponent(buttonNameEnc || "")
      const colorInput = decodeURIComponent(colorEnc || "")
      const color = parseHexColor(colorInput)
      const footer = interaction.fields.getTextInputValue("footer")

      const embed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp(new Date())
      if (color) embed.setColor(color)
      if (footer) embed.setFooter({ text: footer })

      const button = new ButtonBuilder()
        .setCustomId(`${EVENT_EMBED_BUTTON_CREATE_ID}:${interaction.guildId}:${role.id}`)
        .setLabel(buttonName)
        .setStyle(ButtonStyle.Primary)

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
      const sent = await channel.send({ embeds: [embed], components: [row] })

      await discordReply(
        interaction,
        `✅ Posted in <#${channel.id}>. Clicking will toggle ${roleMention(role.id)}. [Jump](${sent.url})!`,
        false,
      )
    } catch (err: any) {
      if (err instanceof ModalButtonCreateError) await discordReply(interaction, err.message)
      else log.error(`Failed to handle ${COMMAND_EMBED_BUTTON_CREATE_ID}: ${ERR.UnexpectedModal}`)
    }
  }
} as Event