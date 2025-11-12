import { DiscordAssert } from '@utils/discord'
import { GrinderRoleMessage } from '../messages/grinder-role'

export class GrinderRole extends GrinderRoleMessage {
    static override BASE_PERMS = [
        ...DiscordAssert.BASE_PERMS,
    ]
}
