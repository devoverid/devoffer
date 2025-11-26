import type { CheckinStreak } from './checkin-streak'
import type { User } from './user'

export type CheckinStatusType = 'WAITING' | 'APPROVED' | 'REJECTED'
export type CheckinAllowedEmojiType = '❌' | '🔥'

export interface Checkin {
    id: number
    public_id: string
    user_id: number
    checkin_streak_id: number
    description: string
    link?: string | null
    status: CheckinStatusType | string
    reviewed_by?: string | null
    comment?: string | null
    created_at: Date
    updated_at?: Date | null

    user?: User
    checkin_streak?: CheckinStreak
}
