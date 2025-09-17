import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, ButtonStyle, MessageFlags } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, roleMention } from "@discordjs/builders";
import { parseHexColor } from "../../../utils/color";
import { Command } from "../command";

export default {
  data: new SlashCommandBuilder()
    .setName("embed-button-create")
    .setDescription("Create an embed in a channel w/ a role-grant button.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt
        .setName("channel")
        .setDescription("Channel in which to post the embed.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("title").setDescription("Title of the embed.").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("description").setDescription("Description of the embed. Discord markdown accepted. Use '<nl>' for new lines.").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("button-name").setDescription("Text to display on the button—make it catchy.").setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName("role").setDescription("Select the role you want users to receive when they click the button.").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("color").setDescription("Hex color like #00AAFF")
    )
    .addStringOption(opt =>
      opt.setName("footer").setDescription("Footer text")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel", true) as TextChannel
    const title = interaction.options.getString("title", true)
    const description = interaction.options.getString("description", true)
    const buttonName = interaction.options.getString("button-name", true)
    const role = interaction.options.getRole("role", true)
    const colorInput = interaction.options.getString("color")
    const color = parseHexColor(colorInput)
    const footer = interaction.options.getString("footer")

    const bot = await interaction.guild!.members.fetchMe()
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.editReply("❌ I need **Manage Roles** permission to assign that role.")
      return
    }

    const botTop = bot.roles.highest.position
    if ("position" in role && role.position >= botTop) {
      await interaction.editReply("❌ I can’t manage that role because it is higher or equal to my top role.")
      return
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setTimestamp(new Date())
    if (color) embed.setColor(color)
    if (footer) embed.setFooter({ text: footer })

    const customId = `role-assign:${interaction.guildId}:${role.id}`
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(buttonName)
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
    const sent = await channel.send({ embeds: [embed], components: [row] })

    await interaction.editReply(
      `✅ Embed posted in <#${channel.id}> with a **${buttonName}** button.\n` +
      `Clicking it will toggle ${roleMention(role.id)}. [Jump to message](${sent.url})`
    )
  }
} as Command