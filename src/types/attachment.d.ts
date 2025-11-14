import type { Checkin } from './checkin'

export interface Attachment {
    id: number
    name: string
    url: string
    type: string
    size: number
    checkin_id: number
    created_at: Date
    checkin: Checkin
}
