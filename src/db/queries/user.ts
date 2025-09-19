import { prisma } from "@db/client"

export const increaseUserStreak = (user_id: number) => {
    return prisma.user.update({
        where: {
            id: user_id
        },
        data: {
            streak_count: {
                increment: 1
            }
        }
    })
}