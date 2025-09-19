import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, TextInputStyle } from "discord.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { Command } from "../../command";
import { getModuleName } from "../../../../utils/io";
import { COMMAND_PATH } from "../..";
import { DUMMY } from "../../../../utils/placeholder";

export const COMMAND_EMBED_ID = getModuleName(COMMAND_PATH, __filename)

export default {
  data: new SlashCommandBuilder()
    .setName("create-embed-role-grant")
    .setDescription("Create an embed in a channel w/ a role-grant button.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt => opt.setName("channel").setDescription("Post channel.").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(opt => opt.setName("button-name").setDescription("Text to display on the button-make it catchy.").setRequired(true))
    .addRoleOption(opt => opt.setName("role").setDescription("Role to toggle.").setRequired(true))
    .addStringOption(opt => opt.setName("color").setDescription("Hex like #FF7518.")),

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel", true) as TextChannel
    const buttonName = interaction.options.getString("button-name", true)
    const role = interaction.options.getRole("role", true)
    const color = interaction.options.getString("color") ?? ""

    const modal = new ModalBuilder()
      .setCustomId(`${COMMAND_EMBED_ID}:${interaction.guildId}:${channel.id}:${role.id}:${encodeURIComponent(buttonName)}:${encodeURIComponent(color)}`)
      .setTitle("Create Embed with Role-Grant Button")
    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Title")
      .setPlaceholder(DUMMY.TITLE)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256)
      .setRequired(true)
    const descInput = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Description")
      .setPlaceholder(DUMMY.DESC)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const footerInput = new TextInputBuilder()
      .setCustomId("footer")
      .setLabel("Footer (optional)")
      .setPlaceholder(DUMMY.FOOTER)
      .setValue(DUMMY.FOOTER)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput),
    )

    await interaction.showModal(modal)
  }
} as Command