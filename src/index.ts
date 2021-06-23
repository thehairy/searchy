import { Client, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { LoadEvents } from './utils.js';
dotenv.config({ path: '../.env' });
import PrettyError from 'pretty-error';
PrettyError.start();

const searchy = new Client({
    intents: 1,
    shards: 'auto',
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    restRequestTimeout: 25000 
});

searchy.slashybois = new Collection();
searchy.eventybois = new Collection();

LoadEvents(searchy).then(() => {
    for (const event of searchy.eventybois.values()) {
        if (event.process) {
            if (event.once) {
                // @ts-expect-error dis is valid bro
                process.once(event.name, (...args) => event.run(...args));
            } 
            else process.on(event.name, (...args) => event.run(...args));
        }
        else {
            if (event.once) searchy.once(event.name, (...args: unknown[]) => event.run(...args, searchy));
            else searchy.on(event.name, (...args: unknown[]) => event.run(...args, searchy));
        }
    }

    if (process.env.CLIENT_TOKEN) {
        searchy.login(process.env.CLIENT_TOKEN);
    }
    else {
        console.log('No client token!');
        process.exit(1);
    }
});

