import type { Attachment } from './attachment'

export interface Checkin {
    id: number
    user_id: number
    description: string
    created_at: Date
    updated_at: Date
    attachments: Attachment[]
}
