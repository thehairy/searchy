import type { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { fetchJSON } from '../utils.js';

export async function run(interaction: CommandInteraction): Promise<unknown> {
    await interaction.defer({ ephemeral: true });
    const start = process.hrtime.bigint();

    return fetchJSON('https://discord.com/api/v9/gateway').then(() => {
        const took = (process.hrtime.bigint() - start) / BigInt('1000000');
        interaction.editReply(`WebSocket ping: ${interaction.client.ws.ping.toFixed(2)} ms\nREST ping: ${took} ms`);
    }, failed => {
        console.log(failed);
        interaction.editReply('Failed to measure ping!');
    });
}

export const data: ApplicationCommandData = {
    name: 'ping',
    description: 'Shows the ping of the bot.'
};