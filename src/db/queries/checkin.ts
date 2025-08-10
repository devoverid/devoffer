import { Prisma } from "../../../db/generated/prisma"
import { prisma } from "../client"

export const createCheckin = (discord_id: string) => {
    return prisma.user.create({
        data: {
            discord_id
        }
    })
}