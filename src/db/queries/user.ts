import { prisma } from '@db/client'

export function increaseUserStreak(user_id: number) {
    return prisma.user.update({
        where: {
            id: user_id,
        },
        data: {
            streak_count: {
                increment: 1,
            },
        },
    })
}
