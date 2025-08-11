import { RoleManager } from "discord.js"

type GrindRole = {
    name?: string
    id: string
    threshold: number
}

let GRIND_ROLES: GrindRole[] = [
    {
        id: "1403320928519327755",
        threshold: 1,
    },
    {
        id: "1403320958202282047",
        threshold: 7,
    },
    {
        id: "1403321016406638674",
        threshold: 30,
    },
    {
        id: "1403322168841994340",
        threshold: 90,
    },
    {
        id: "1403321040448258138",
        threshold: 180,
    },
    {
        id: "1403321099688607774",
        threshold: 270,
    },
    {
        id: "1403321123331899402",
        threshold: 364,
    },
]

export const getGrindRoles = (roleManager?: RoleManager) => {
    if (!GRIND_ROLES[0].name && roleManager) {
        GRIND_ROLES.forEach(r => {
            const role = roleManager.cache.find(role => role.id == r.id)
            if (role) {
                r.name = role.name
            }
        })
    }
    return GRIND_ROLES
}
