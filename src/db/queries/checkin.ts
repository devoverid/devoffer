import type { Attachment } from 'discord.js'
import { prisma } from '@db/client'

export async function createCheckin(user_id: number, description: string, attachments?: Attachment[] | undefined) {
    const checkin = await prisma.checkin.create({
        data: {
            user: {
                connect: {
                    id: user_id,
                },
            },
            description,
        },
    })

    if (attachments && attachments.length > 0) {
        await prisma.attachment.createMany({
            data: attachments.map(attachment => ({
                name: attachment.name,
                url: attachment.url,
                type: attachment.contentType ?? undefined,
                size: attachment.size,
                module_id: checkin.id,
                module_type: 'CHECKIN',
            })),
        })
    }
}
