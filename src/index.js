const { Client, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
client.login();

client.clickybois = new Collection();
client.slashybois = new Collection();

const clickyFiles = fs.readdirSync('./src/clickybois').filter(file => file.endsWith('.js'));
const eventyFiles = fs.readdirSync('./src/eventybois').filter(file => file.endsWith('.js'));
const slashyFiles = fs.readdirSync('./src/slashybois').filter(file => file.endsWith('.js'));

for (const file of clickyFiles) {
    const clickyboi = require(`./clickybois/${file}`);
    client.clickybois.set(clickyboi.name, clickyboi);
}

for (const file of slashyFiles) {
    const slashyboi = require(`./slashybois/${file}`);
    client.slashybois.set(slashyboi.name, slashyboi);
}

for (const file of eventyFiles) {
    const eventyboi = require(`./eventybois/${file}`);
    if (eventyboi.once) {
        client.once(eventyboi.name, (...args) => eventyboi.execute(client, ...args));
    } else {
        client.on(eventyboi.name, (...args) => eventyboi.execute(client, ...args));
    }
}