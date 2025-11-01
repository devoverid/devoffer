import type { Checkin } from './checkin'

export interface User {
    id: number
    discord_id: string
    streak_count: number
    streak_start?: Date
    last_streak_end?: Date
    created_at: Date
    updated_at: Date
    checkins: Checkin[]
}
