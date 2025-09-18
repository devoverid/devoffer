import { Logger } from "../types/log";
import { timestamp } from "./date";

export const log: Logger = {
  base: (msg: string): void => console.log(`[INFO ${timestamp()}] ${msg}`),
  info: (msg: string): void => console.log(`[INFO ${timestamp()}] ✨ ${msg}`),
  success: (msg: string): void => console.log(`[INFO ${timestamp()}] ✅ ${msg}`),
  check: (msg: string): void => console.log(`[INFO ${timestamp()}] 🔍 ${msg}`),
  warn: (msg: string): void => console.log(`[INFO ${timestamp()}] ⚠️ ${msg}`),
  error: (msg: string): void => console.log(`[INFO ${timestamp()}] ❌ ${msg}`),
}