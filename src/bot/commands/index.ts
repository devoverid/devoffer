import { ChatInputCommandInteraction, Client, Collection, SlashCommandBuilder } from "discord.js"
import fs from "fs"
import path from "path"

export interface Command {
  data: SlashCommandBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}


export const registerCommands = async (client: Client) => {
  client.commands = new Collection<string, Command>()


  const foldersPath = path.join(__dirname, '/');
  const commandFolders = fs.readdirSync(foldersPath).filter((f) => !f.includes('.ts'));
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      console.log(`Registering command ${folder}.${file.split(".")[0]}`)

      try {
        const { default: command } = await import(filePath) as { default: Command }
        client.commands.set(command.data.name, command);
      } catch (err) {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>
  }
}
