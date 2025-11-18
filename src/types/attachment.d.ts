export interface Attachment {
    id: number
    name: string
    url: string
    type: string
    size: number
    module_id: number
    module_type: AttachmentModuleType
    created_at: Date
}

export type AttachmentModuleType = 'CHECKIN'
