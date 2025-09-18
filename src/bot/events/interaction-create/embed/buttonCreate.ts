import { Events, GuildMember, Interaction } from "discord.js"
import { Event } from "../../event"
import { generateCustomId } from "../../../../utils/io"
import { EVENT_PATH } from "../.."
import { discordReply, getDiscordBot, getDiscordRole } from "../../../../utils/discord"
import { log } from "../../../../utils/logger"
import { ERR, MSG } from "./messages"
import { assertMember, assertMemberHasRole, assertRole, assertRoleManageable, getButtonCustomId } from "./validators"

export class ButtonCreateError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "ButtonCreateError"
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export const EVENT_EMBED_BUTTON_CREATE_ID = generateCustomId(EVENT_PATH, __filename)

export default {
  name: Events.InteractionCreate,
  desc: "Handles role assignment button interactions and toggles roles for users.",
  async exec(_, interaction: Interaction) {
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith(EVENT_EMBED_BUTTON_CREATE_ID)) throw new ButtonCreateError(ERR.InvalidButton)

    try {
      const { roleId } = getButtonCustomId(interaction, interaction.customId)

      const member = interaction.member! as GuildMember
      assertMember(member)

      const role = await getDiscordRole(interaction, roleId)
      assertRole(role)

      const bot = await getDiscordBot(interaction)
      assertRoleManageable(interaction.guild!, bot, role)

      assertMemberHasRole(member, role)

      await member.roles.add(role)
      await discordReply(interaction, MSG.Granted(role.id))
    } catch (err: any) {
      if (err instanceof ButtonCreateError) await discordReply(interaction, err.message)
      else log.error(`Failed to handle ${EVENT_EMBED_BUTTON_CREATE_ID}: ${ERR.UnexpectedButton}`)
    }
  }
} as Event