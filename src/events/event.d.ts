import { Client } from "discord.js"

export interface Event {
  name: string
  desc: string
  once?: boolean
  exec: (client: Client, ...args: any[]) => void
}