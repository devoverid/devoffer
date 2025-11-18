import type { Checkin } from './checkin'

export interface User {
    id: number
    discord_id: string
    streak_count: number
    streak_start?: Date | null
    last_streak_end?: Date | null
    created_at: Date
    updated_at?: Date | null
    checkins: Checkin[]
}
