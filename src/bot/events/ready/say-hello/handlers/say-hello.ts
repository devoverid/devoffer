import type { Client } from 'discord.js'

export default {
    name: 'ready',
    desc: 'Say こんにちは for the first load',
    once: true,
    exec(client: Client) {
        console.warn(`こんにちは、${client.user?.tag}`)
    },
}
