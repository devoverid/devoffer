import { prisma } from '@db/client'

export function createCheckin(user_id: number, description: string) {
    return prisma.checkin.create({
        data: {
            user: {
                connect: {
                    id: user_id,
                },
            },
            description,
        },
    })
}
