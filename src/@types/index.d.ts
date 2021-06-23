import Discord from 'discord.js';

declare module 'discord.js' {
    interface Client {
        slashybois: Discord.Collection<string, Command>;
        eventybois: Discord.Collection<string, Event>;
        owner: string;
    }
}

interface Command {
    data: Discord.ApplicationCommandData;
    async run(interaction: Discord.CommandInteraction): Promise<unknown>;
}

interface Event {
    name: string;
    once?: boolean;
    process?: boolean
    async run(...args: unknown[]): Promise<void>;
}

interface NPMUser {
    name: string;
    email: string;
}