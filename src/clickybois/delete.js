const { Permissions } = require('discord.js');

module.exports = {
    name: 'delete',
    execute: async (client, interaction) => {
        await interaction.defer({ ephemeral: true });
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return interaction.deleteReply();
        } else {
            return interaction.followUp({ content: `You don't have enough permissions.` });
        }
    }
}