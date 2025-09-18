import { Client } from "discord.js"
import { Event } from "./event"
import { getRootPath, readFiles } from "../../utils/io"
import path from "path"
import { log } from "../../utils/logger"

const root = path.basename(__dirname)
const files = readFiles(__dirname)

export const registerEvents = async (client: Client) => {
  for (const file of files) {
    const { default: event } = await import(file) as { default: Event }
    const fileName = getRootPath(root, file)
    log.info(`Registering event ${fileName}...`)

    if (event.once) {
      client.once(event.name, (...args) => event.exec(client, ...args))
    } else {
      client.on(event.name, (...args) => {
        event.exec(client, ...args)
      })
    }
  }
}