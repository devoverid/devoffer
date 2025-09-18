import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from './bot/commands/command';
import { log } from './utils/logger';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'bot/commands');
const commandFolders = fs.readdirSync(foldersPath).filter((f) => !f.includes('.ts'));

log.base("🚀 Deploying commands...")
for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		log.info(`Registering command ${folder}.${file.split(".")[0]}!`)

		const { default: command } = await import(filePath) as { default: Command }
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			log.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
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