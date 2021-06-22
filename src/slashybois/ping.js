const create = {
    name: 'ping',
    description: 'Shows the ping of the bot.'
}

module.exports = {
    name: 'ping',
    create: create,
    execute: async (client, interaction) => {
        await interaction.defer({ ephemeral: true });
        await interaction.editReply({ content: `The ping is ${client.ws.ping}ms.` });
    }
}