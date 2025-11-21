import type { Checkin } from './checkin'

export interface CheckinStreak {
    id: number
    user_id: number
    first_date: Date
    last_date?: Date | null
    streak: number
    updated_at?: Date | null

    user?: User
    checkins?: Checkin[]
}
