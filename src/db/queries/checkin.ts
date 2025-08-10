import { Prisma } from "../../../db/generated/prisma"
import { prisma } from "../client"

export const createCheckin = (user_id: number, description: string) => {
    return prisma.checkin.create({
        data: {
            user: {
                connect: {
                    id: user_id
                }
            },
            description,
        }
    })
}