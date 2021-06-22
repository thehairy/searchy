module.exports = {
    name: 'interaction',
    once: false,
    execute: (client, interaction) => {
        console.log('Received an interaction!');
        if (interaction.isCommand()) {
            const slashyboi = interaction.commandName;
            if (!client.slashybois.has(slashyboi)) return;
            try {
                client.slashybois.get(slashyboi).execute(client, interaction);
            } catch (error) {
                console.log(error);
            }
        } else if (interaction.isButton()) {
            const clickyboi = interaction.customID;
            if (!client.clickybois.has(clickyboi)) return;
            try {
                client.clickybois.get(clickyboi).execute(client, interaction);
            } catch (error) {
                console.log(error);
            }
        } else {
            return;
        }
    }
}