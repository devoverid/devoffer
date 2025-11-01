/* eslint-disable no-console */
import type { Logger } from '@type/log'
import { timestamp } from './date'

export const log: Logger = {
    base: (msg: string): void => console.log(`[INFO ${timestamp()}] ${msg}`),
    info: (msg: string): void => console.log(`[INFO ${timestamp()}] ✨ ${msg}`),
    success: (msg: string): void => console.log(`[SUCCESS ${timestamp()}] ✅ ${msg}`),
    check: (msg: string): void => console.log(`[CHECKING ${timestamp()}] 🔍 ${msg}`),
    warn: (msg: string): void => console.log(`[WARNING ${timestamp()}] ⚠️ ${msg}`),
    error: (msg: string): void => console.log(`[ERROR ${timestamp()}] ❌ ${msg}`),
}
