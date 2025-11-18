import type { Checkin } from './checkin'

export interface CheckinStreak {
    id: number
    user_id: number
    first_date: Date
    last_date: Date
    count: number
    created_at: Date
    updated_at?: Date | null

    user?: User
    checkins?: Checkin[]
}
