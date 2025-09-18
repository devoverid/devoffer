import { Events, GuildMember, Interaction, MessageFlags, PermissionFlagsBits } from "discord.js"
import { Event } from "../../event"
import { generateCustomId } from "../../../../utils/io"
import { EVENT_PATH } from "../.."
import { getDiscordRole } from "../../../../utils/discord"
import { log } from "../../../../utils/logger"

export class ButtonCreateError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ButtonCreateError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const EVENT_EMBED_BUTTON_CREATE_ID = generateCustomId(EVENT_PATH, __filename)

export default {
  name: Events.InteractionCreate,
  desc: "Handles role assignment button interactions and toggles roles for users.",
  async exec(_, interaction: Interaction) {
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith(EVENT_EMBED_BUTTON_CREATE_ID)) return

    try {
      const [_, guildId, roleId] = interaction.customId.split(":")

      if (interaction.guildId !== guildId) throw new ButtonCreateError("⚠️ This button isn’t valid for this server.")

      const member = interaction.member! as GuildMember
      if (!member || !("roles" in member)) throw new ButtonCreateError("⚠️ Couldn’t resolve your member record.")

      const bot = await interaction.guild!.members.fetchMe()
      if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) throw new ButtonCreateError("❌ I don’t have **Manage Roles**.")

      const role = await getDiscordRole(interaction, roleId)
      if (!role) throw new ButtonCreateError("⚠️ The role no longer exists.")

      if (role.position >= bot.roles.highest.position) throw new ButtonCreateError("❌ I can’t manage that role (it’s above my highest role).")

      const hasRole = member.roles.cache.has(role.id)
      if (hasRole) throw new ButtonCreateError("❌ You already have the ${role} role.")

      await member.roles.add(role)
      await interaction.reply({ content: `✅ Granted ${role} to you.`, flags: MessageFlags.Ephemeral })
    } catch (err: any) {
      const msg = err instanceof ButtonCreateError ? err.message : "❌ Something went wrong while handling the embed button create."
      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral })
      log.error(`Failed to handle ${EVENT_EMBED_BUTTON_CREATE_ID}: ${msg}`)
    }
  }
} as Event