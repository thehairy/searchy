import { Client, ClientApplication, User, Team } from 'discord.js';
import { LoadCommands, DeployCommands } from '../../utils.js';
import LCL from 'last-commit-log';

export default {
    name: 'ready',
    once: true,
    async run(searchy: Client): Promise<void> {
        const app = await searchy.application?.fetch().catch(x => console.log('Failed to fetch owner: ' + x));
        if (app && app instanceof ClientApplication && app.owner && app.owner instanceof User) searchy.owner = app.owner.id;
        else if (app && app instanceof ClientApplication && app.owner && app.owner instanceof Team) searchy.owner = app.owner.ownerID as string;

        await LoadCommands(searchy);
        await DeployCommands(searchy);

        console.log('Ready!');

        const lcl = new LCL('../');
        const commit = await lcl.getLastCommit();
        if (commit) console.log(`Logged in as \`${searchy.user?.tag}\`.\n[#${commit.shortHash}](<${commit.gitUrl}/commit/${commit.hash}>) - \`${commit.subject}\` by \`${commit.committer.name}\` on branch [${commit.gitBranch}](<${commit.gitUrl}/tree/${commit.gitBranch}>).`);
    }
};