/* eslint-disable no-console */
import type { Logger } from '@type/log'
import { ANSI_COLORS } from '@constants'
import { timestamp } from './date'

export const log: Logger = {
    base: (msg: string) =>
        console.log(`${ANSI_COLORS.white}[INFO ${timestamp()}]${ANSI_COLORS.reset} ${msg}`),

    info: (msg: string) =>
        console.log(`${ANSI_COLORS.cyan}[INFO ${timestamp()}] ✨ ${ANSI_COLORS.reset} ${msg}`),

    success: (msg: string) =>
        console.log(`${ANSI_COLORS.green}[SUCCESS ${timestamp()}] ✅ ${ANSI_COLORS.reset} ${msg}`),

    check: (msg: string) =>
        console.log(`${ANSI_COLORS.blue}[CHECKING ${timestamp()}] 🔍 ${ANSI_COLORS.reset} ${msg}`),

    warn: (msg: string) =>
        console.log(`${ANSI_COLORS.yellow}[WARNING ${timestamp()}] ⚠️ ${ANSI_COLORS.reset} ${msg}`),

    error: (msg: string) =>
        console.log(`${ANSI_COLORS.red}[ERROR ${timestamp()}] ❌ ${ANSI_COLORS.reset} ${msg}`),
}
