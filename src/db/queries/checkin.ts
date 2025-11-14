import type { Attachment } from 'discord.js'
import { prisma } from '@db/client'

export function createCheckin(user_id: number, description: string, attachments?: Attachment[] | undefined) {
    return prisma.checkin.create({
        data: {
            user: {
                connect: {
                    id: user_id,
                },
            },
            description,
            attachments: {
                create: attachments?.map(attachment => ({
                    name: attachment.name,
                    url: attachment.url,
                    type: attachment.contentType,
                    size: attachment.size,
                })),
            },
        },
    })
}
