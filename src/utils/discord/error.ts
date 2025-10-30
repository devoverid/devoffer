import { timestamp } from '@utils/date'

export class DiscordBaseError extends Error {
    constructor(name: string, message: string, options?: { cause?: unknown }) {
        super(message, options)
        this.name = name
        Object.setPrototypeOf(this, new.target.prototype)

        console.error(`[${timestamp()}] ${this.name}: ${message}`)
    }

    toJSON() {
        return { name: this.name, message: this.message, stack: this.stack }
    }
}
