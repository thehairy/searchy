module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('Ready to search.');

        client.slashybois.each(slashyboi => {
            client.guilds.cache.first().commands.create(slashyboi.create);
        });
    }
};