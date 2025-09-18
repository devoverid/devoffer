import { Client } from "discord.js"
import { Event } from "./event"
import { getModuleName, readFiles } from "../../utils/io"
import path from "path"
import { log } from "../../utils/logger"

export const EVENT_PATH = path.basename(__dirname)
const files = readFiles(__dirname)

export const registerEvents = async (client: Client) => {
  for (const file of files) {
    const { default: event } = await import(file) as { default: Event }
    const fileName = getModuleName(EVENT_PATH, file)
    log.info(`Registering event ${fileName}...`)

    try {
      if (event.once) {
        client.once(event.name, (...args) => event.exec(client, ...args))
      } else {
        client.on(event.name, (...args) => {
          event.exec(client, ...args)
        })
      }
    } catch (err) {
      log.error(`Failed to register event ${fileName}: ${err}`);
    }
  }
}