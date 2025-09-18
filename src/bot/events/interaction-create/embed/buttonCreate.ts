import { Events, GuildMember, Interaction, MessageFlags, PermissionFlagsBits } from "discord.js"
import { Event } from "../../event"
import { generateCustomId } from "../../../../utils/io"
import { EVENT_PATH } from "../.."
import { getDiscordRole } from "../../../../utils/discord"

export const EVENT_EMBED_BUTTON_CREATE_ID = generateCustomId(EVENT_PATH, __filename)

export default {
  name: Events.InteractionCreate,
  desc: "Handles role assignment button interactions and toggles roles for users.",
  async exec(_, interaction: Interaction) {
    if (interaction.isButton() && interaction.customId.startsWith("role-assign")) {
      const [_, guildId, roleId] = interaction.customId.split(":")

      if (interaction.guildId !== guildId) {
        await interaction.reply({ content: "⚠️ This button isn’t valid for this server.", flags: MessageFlags.Ephemeral })
        return
      }

      const member = interaction.member! as GuildMember
      if (!member || !("roles" in member)) {
        await interaction.reply({ content: "⚠️ Couldn’t resolve your member record.", flags: MessageFlags.Ephemeral })
        return
      }

      const bot = await interaction.guild!.members.fetchMe()
      if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.reply({ content: "❌ I don’t have **Manage Roles**.", flags: MessageFlags.Ephemeral })
        return
      }

      const role = await getDiscordRole(interaction, roleId)
      if (!role) {
        await interaction.reply({ content: "⚠️ The role no longer exists.", flags: MessageFlags.Ephemeral })
        return
      }

      if (role.position >= bot.roles.highest.position) {
        await interaction.reply({ content: "❌ I can’t manage that role (it’s above my highest role).", flags: MessageFlags.Ephemeral })
        return
      }

      const hasRole = member.roles.cache.has(role.id)
      if (hasRole) {
        await interaction.reply({ content: `❌ You already have the ${role} role.`, flags: MessageFlags.Ephemeral })
        return
      }

      try {
        await member.roles.add(role)
        await interaction.reply({ content: `✅ Granted ${role} to you.`, flags: MessageFlags.Ephemeral })
      } catch (err) {
        await interaction.reply({ content: "❌ I couldn’t update your roles. Check my permissions & role hierarchy.", flags: MessageFlags.Ephemeral })
      }
    }
  }
} as Event