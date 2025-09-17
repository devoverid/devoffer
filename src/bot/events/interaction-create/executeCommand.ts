import { Client, Interaction, Message, MessageFlags } from "discord.js"
import { Command } from "../../commands/command";

export default {
    name: "interactionCreate",
    desc: "Executing a command when an interaction is created",
    async exec(client: Client, interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command: Command | undefined = interaction.client.commands.get(interaction.commandName)
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    }
}