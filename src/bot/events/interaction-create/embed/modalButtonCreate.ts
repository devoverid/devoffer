import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Interaction, MessageFlags, PermissionFlagsBits, roleMention } from "discord.js"
import { Event } from "../../event"
import { parseHexColor } from "../../../../utils/color"
import { COMMAND_EMBED_BUTTON_CREATE_ID } from "../../../commands/embed/buttonCreate"
import { getDiscordChannel, getDiscordRole } from "../../../../utils/discord"
import { EVENT_EMBED_BUTTON_CREATE_ID } from "./buttonCreate"

export default {
  name: Events.InteractionCreate,
  desc: "Handles modal submissions for creating an embed with a role-grant button.",
  async exec(_, interaction: Interaction) {
    if (!interaction.isModalSubmit()) return
    if (!interaction.inCachedGuild()) return
    if (interaction.customId !== COMMAND_EMBED_BUTTON_CREATE_ID) return

    const [, channelId, roleId, buttonNameEnc, colorEnc] = interaction.customId.split(":")

    const channel = await getDiscordChannel(interaction, channelId)
    const role = await getDiscordRole(interaction, roleId)
    if (!channel || !role) {
      await interaction.reply({ content: "⚠️ Channel or role not found.", flags: MessageFlags.Ephemeral })
      return
    }

    const bot = interaction.guild.members.me ?? await interaction.guild.members.fetchMe()
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles) || !role.editable) {
      await interaction.reply({ content: "❌ I can’t manage that role. Check permissions & role hierarchy.", flags: MessageFlags.Ephemeral })
      return
    }

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");
    const buttonName = decodeURIComponent(buttonNameEnc || "")
    const colorInput = decodeURIComponent(colorEnc || "")
    const color = parseHexColor(colorInput)
    const footer = interaction.fields.getTextInputValue("footer");

    const embed = new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp(new Date())
    if (color) embed.setColor(color)
    if (footer) embed.setFooter({ text: footer })

    const button = new ButtonBuilder()
      .setCustomId(`${EVENT_EMBED_BUTTON_CREATE_ID}:${interaction.guildId}:${role.id}`)
      .setLabel(buttonName)
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
    const sent = await channel.send({ embeds: [embed], components: [row] })

    await interaction.reply({
      content: `✅ Posted in <#${channel.id}>. Clicking will toggle ${roleMention(role.id)}. [Jump](${sent.url})`
    });
  }
} as Event