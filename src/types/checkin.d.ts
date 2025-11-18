export interface Checkin {
    id: number
    user_id: number
    checkin_streak_id: number
    description: string
    status: CheckinStatusType
    created_at: Date
    updated_at?: Date | null

    user?: User
    checkin_streak?: CheckinStreak
}

export type CheckinStatusType = 'WAITING' | 'APPROVED' | 'REJECTED'
