import { prisma } from "../client"

export const increaseUserStreak = async (user_id: number) => {
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