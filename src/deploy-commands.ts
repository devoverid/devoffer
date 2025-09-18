import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import { Command } from './bot/commands/command';
import { getModuleName, readFiles } from './utils/io';
import path from 'path';
import { log } from './utils/logger';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
// Grab all the command folders from the commands directory you created earlier
const root = path.join(__dirname, 'bot/commands')
const files = readFiles(root)

log.base("🚀 Deploying commands...")
for (const file of files) {
	const fileName = getModuleName(root, file)
	log.info(`Registering command ${fileName}...`)

	try {
		const { default: command } = await import(file) as { default: Command }
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			log.error(`The command at ${file} is missing a required "data" or "execute" property.`);
		}
	} catch (err) {
		log.error(`Failed to import command at ${file}: ${err}`);
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
		log.error(`Error while deploying commands: ${error}`);
	}
})();