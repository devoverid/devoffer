import { prisma } from '@db/client'

export async function increaseUserStreak(user_id: number) {
    return await prisma.user.update({
        where: {
            id: user_id,
        },
        data: {
            streak_count: { increment: 1 },
        },
        include: {
            checkins: {
                orderBy: { created_at: 'desc' },
                select: { created_at: true },
                take: 2,
            },
        },
    })
}
