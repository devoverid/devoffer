import type { Checkin } from './checkin'

export interface Attachment {
    id: number
    name: string
    url: string
    type: string
    size: number
    module_id: number
    module_type: AttachmentModuleType
    created_at: Date
    checkin: Checkin
}

export type AttachmentModuleType = 'CHECKIN'
