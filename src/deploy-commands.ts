import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from './bot/commands/command';
import { log } from './utils/logger';
import { getRootPath, readFiles } from './utils/io';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
// Grab all the command folders from the commands directory you created earlier
const root = path.join(__dirname, 'bot/commands')
const files = readFiles(root)

log.base("🚀 Deploying commands...")
for (const file of files) {
	const fileName = getRootPath(root, file)
	log.info(`Registering command ${fileName}...`)

	const { default: command } = await import(file) as { default: Command }
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		log.warn(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.APP_TOKEN!);

// and deploy your commands!
(async () => {
	try {
		log.check(`Started refreshing ${commands.length} application (/) commands...`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!),
			{ body: commands },
		);

		log.success(`Successfully reloaded ${(data as unknown[]).length} application (/) commands~`);
		log.base("🚀 Commands deployed!")
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();