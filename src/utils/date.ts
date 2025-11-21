export function isDateToday(date: Date): boolean {
    const today = new Date()

    return date.getUTCFullYear() === today.getUTCFullYear()
        && date.getUTCMonth() + 1 === today.getUTCMonth() + 1
        && date.getUTCDate() === today.getUTCDate()
}

export function isDateYesterday(date: Date): boolean {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setUTCDate(today.getUTCDate() - 1)

    return (
        date.getUTCFullYear() === yesterday.getUTCFullYear()
        && date.getUTCMonth() === yesterday.getUTCMonth()
        && date.getUTCDate() === yesterday.getUTCDate()
    )
}

export const timestamp = (): string => new Date().toISOString()

export const getNow = () => new Date().toLocaleString('id-ID')
