import type { Event } from '@events/event'
import type { GuildMember, Interaction, TextChannel } from 'discord.js'
import { EVENT_PATH } from '@events/index'
import { generateCustomId } from '@utils/component'
import { getBot, getRole, sendReply } from '@utils/discord'
import { DiscordBaseError } from '@utils/discord/error'
import { log } from '@utils/logger'
import { Events } from 'discord.js'
import { RoleGrantCreate } from '../validators/role-grant-create'

export class EmbedRoleGrantButtonError extends DiscordBaseError {
    constructor(message: string, options?: { cause?: unknown }) {
        super('EmbedRoleGrantButtonError', message, options)
    }
}

export const EVENT_EMBED_ROLE_GRANT_CREATE_BUTTON_ID = generateCustomId(EVENT_PATH, __filename)

export default {
    name: Events.InteractionCreate,
    desc: 'Handles role assignment button interactions and adds a role for users.',
    async exec(_, interaction: Interaction) {
        if (!interaction.isButton())
            return

        try {
            if (!interaction.inCachedGuild())
                throw new EmbedRoleGrantButtonError(RoleGrantCreate.ERR.NotGuild)

            RoleGrantCreate.assertButton(interaction.customId, EVENT_EMBED_ROLE_GRANT_CREATE_BUTTON_ID)

            const channel = interaction.channel as TextChannel
            RoleGrantCreate.assertMissPerms(interaction, channel)

            const { roleId } = RoleGrantCreate.getButtonId(interaction, interaction.customId)
            const member = interaction.member as GuildMember
            const role = await getRole(interaction, roleId)
            const bot = await getBot(interaction)

            RoleGrantCreate.assertMember(member)
            RoleGrantCreate.assertRole(role)
            RoleGrantCreate.assertRoleManageable(interaction.guild, bot, role)
            RoleGrantCreate.assertMemberHasRole(member, role)

            await member.roles.add(role)
            await sendReply(interaction, RoleGrantCreate.roleGranted(role.id))
        }
        catch (err: any) {
            if (err instanceof DiscordBaseError)
                await sendReply(interaction, err.message)
            else log.error(`Failed to handle ${EVENT_EMBED_ROLE_GRANT_CREATE_BUTTON_ID}: ${RoleGrantCreate.ERR.UnexpectedButton}: ${err}`)
        }
    },
} as Event
