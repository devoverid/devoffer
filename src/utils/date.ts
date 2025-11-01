export function isDateToday(date: Date): boolean {
    const today = new Date()

    return date.getUTCFullYear() === today.getUTCFullYear()
        && date.getUTCMonth() + 1 === today.getUTCMonth() + 1
        && date.getUTCDate() === today.getUTCDate()
}

export function getYesterday() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getUTCDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    return yesterday
}

export const timestamp = (): string => new Date().toISOString()

export const getNow = () => new Date().toLocaleString('id-ID')
