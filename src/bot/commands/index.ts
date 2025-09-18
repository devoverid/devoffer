import { Client, Collection } from "discord.js"
import { Command } from "./command"
import { getRootPath, readFiles } from "../../utils/io"
import path from "path"
import { log } from "../../utils/logger"

const root = path.basename(__dirname)
const files = readFiles(__dirname)

export const registerCommands = async (client: Client) => {
  client.commands = new Collection<string, Command>()

  for (const file of files) {
    const fileName = getRootPath(root, file)
    log.info(`Registering command ${fileName}...`)

    try {
      const { default: command } = await import(file) as { default: Command }
      client.commands.set(command.data.name, command);
    } catch (err) {
      log.warn(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
    }
  }
}
