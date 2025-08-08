import { Client } from "discord.js"
import fs from "fs"
import path from "path"
import { Event } from "./event"

export const registerEvents = async (client: Client) => {
  const eventFolders = fs.readdirSync(__dirname).filter(file => file !== "index.ts")

  for (const folder of eventFolders) {
    const folderPath = path.join(__dirname, folder)
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".ts"))
      for (const file of files) {
        const filePath = path.join(folderPath, file)
        const { default: event } = await import(filePath) as { default: Event }
        console.log(`Registering event ${event.name}.${file.split(".")[0]}...`)

        if (event.once) {
          client.once(event.name, (...args) => event.exec(client, ...args))
        } else {
          client.on(event.name, (...args) => {
            event.exec(client, ...args)
          })
        }
      }
    }
  }
}