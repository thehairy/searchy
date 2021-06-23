import type { Interaction, Client } from 'discord.js';

export default {
    name: 'interaction',
    async run(interaction: Interaction, searchy: Client): Promise<void> {
        if (interaction.isCommand()) {
            if (!interaction.guild) return interaction.reply({ content: 'DM commands are not supported!', ephemeral: true });

            if (!searchy.slashybois.has(interaction.commandName)) return;

            try {
                await searchy.slashybois.get(interaction.commandName)?.run(interaction);
            } catch (error) {
                console.error(error.stack);
                await interaction.reply({ content: `There was an error while executing this command!\n\`${error.message}\`` , ephemeral: true });
            }
        }
        else if (interaction.isButton()) await interaction.deferUpdate();
        else return;
    }
};