import { Client, Snowflake} from 'discord.js';
import type { Command } from './@types/index';
import recursive from 'recursive-readdir';
import path from 'path';
import Md5 from 'md5';
import fetch from 'node-fetch';

export function fetchJSON(url: string) : Promise<any> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        if (!url || typeof url != 'string') return reject('No URL');

        try {
            const res = await fetch(url);
            resolve(await res.json());
        }

        catch (e) { reject(e); }
    });
    
}

export function normalize(num: number): string {
    if (num == undefined || typeof num != 'number') return '';
    return num.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

export function _trimArray(arr: Array<string>) {
    if (arr.length > 10) {
        const len = arr.length - 10;
        arr = arr.slice(0, 10);
        arr.push(`${len} more...`);
    }

    return arr;
}

export async function LoadEvents(searchy: Client): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = process.hrtime.bigint();

        recursive('./eventybois', async (err, files) => {
            if (err) {
                console.log('Error while reading events:\n' + err);
                return reject(err);
            }
        
            const jsfiles = files.filter(fileName => fileName.endsWith('.js') && !path.basename(fileName).startsWith('_'));
            if (jsfiles.length < 1) {
                console.log('No events to load!');
                return reject('No events!');
            }

            console.log(`Found ${jsfiles.length} events`);

            for (const file_path of jsfiles) {
                const start = process.hrtime.bigint();

                const props = await import(`./${file_path}`);
                    
                searchy.eventybois.set(props.default.name, props.default);
            
                const end = process.hrtime.bigint();
                const took = (end - start) / BigInt('1000000');
            
                console.log(`${normalize(jsfiles.indexOf(file_path) + 1)} - ${file_path} loaded in ${took}ms`);
            }
        
            const end = process.hrtime.bigint();
            const took = (end - start) / BigInt('1000000');
            console.log(`All events loaded in \`${took}ms\``);
            resolve();
        });
    });
}

export async function LoadCommands(searchy: Client): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = process.hrtime.bigint();

        recursive('./slashybois', async (err, files) => {
            if (err) {
                console.log('Error while reading commands:\n' + err);
                return reject(err);
            }
    
            const jsfiles = files.filter(fileName => fileName.endsWith('.js') && !path.basename(fileName).startsWith('_'));
            if (jsfiles.length < 1) {
                console.log('No commands to load!');
                return reject('No commmands');
            }

            console.log(`Found ${jsfiles.length} commands`);

            for (const file_path of jsfiles) {
                const cmd_start = process.hrtime.bigint();

                const props: Command = await import(`./${file_path}`);
                
                searchy.slashybois.set(props.data.name, props);
        
                const cmd_end = process.hrtime.bigint();
                const took = (cmd_end - cmd_start) / BigInt('1000000');
        
                console.log(`${normalize(jsfiles.indexOf(file_path) + 1)} - ${file_path} loaded in ${took}ms`);
            }
    
            const end = process.hrtime.bigint();
            const took = (end - start) / BigInt('1000000');
            console.log(`All commands loaded in \`${took}ms\``);

            resolve();
        });
    });
}

export async function DeployCommands(searchy: Client): Promise<void | boolean> {
    let data = [];
    for (const item of searchy.slashybois.values()) data.push(item.data);

    if (searchy.user?.id === process.env.PROD_CLIENT_ID) {
        const globalcmds = await searchy.application?.commands.fetch();

        if (!globalcmds) {
            await searchy.application?.commands.set(data);
            return console.log('Application Commands deployed!');
        }

        if (globalcmds?.size !== searchy.slashybois.size) {
            await searchy.application?.commands.set(data);
            return console.log('Application Commands deployed!');
        }
        
        else {
            const globallocalhash = Md5((JSON.stringify(data.map(x => x.options).filter(x => x !== undefined && (x as unknown as boolean) !== Array.isArray(x) && x.length))));
            const globalhash = Md5((JSON.stringify(globalcmds.map(x => x.options).filter(x => x !== undefined && (x as unknown as boolean) !== Array.isArray(x) && x.length))));

            if (globallocalhash !== globalhash) await searchy.application?.commands.set(data);
            return console.log('Application Commands deployed!');
        }
    }

    else if (searchy.user?.id === process.env.DEV_CLIENT_ID) {
        await searchy.guilds.cache.get(process.env.DEV_GUILD_ID as Snowflake)?.commands.set(data);
        return console.log('Application Commands deployed!');
    }
}