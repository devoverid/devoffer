import type { Command } from '@commands'
import type { Collection } from 'discord.js'
import type { PrismaClient } from '../../db/generated/prisma'

declare module 'discord.js' {
    interface Client {
        prisma: PrismaClient
        commands: Collection<string, Command>
    }
}
