import type { Interaction, Client } from 'discord.js';

export default {
  name: 'interaction',
  async run(interaction: Interaction, searchy: Client): Promise<unknown> {
    if (interaction.isCommand()) {
      if (!interaction.guild)
        return interaction.reply({
          content: 'DM commands are not supported!',
          ephemeral: true,
        });

      if (!searchy.slashybois.has(interaction.commandName)) return null;

      try {
        const cmd = await searchy.slashybois
          .get(interaction.commandName)
          ?.run(interaction);
        return cmd;
      } catch (error) {
        await interaction.reply({
          content: `There was an error while executing this command!\n\`${error.message}\``,
          ephemeral: true,
        });
        return console.error(error.stack);
      }
    } else if (interaction.isButton()) {
      await interaction.deferUpdate();
      return null;
    } else return null;
  },
};
