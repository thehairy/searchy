/* eslint-disable consistent-return */
import type { Client, Snowflake } from 'discord.js';
import recursive from 'recursive-readdir';
import path from 'path';
import Md5 from 'md5';
import fetch from 'node-fetch';
import type { Command } from './@types/index';

export function fetchJSON(url: string) : Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (!url || typeof url !== 'string') return reject(new Error('No URL'));

    try {
      const res = await fetch(url);
      resolve(await res.json());
    } catch (e) { reject(e); }
  });
}

export function cleanBreaks(str: string): string {
  return str.replace(/\n\r/g, '');
}

export function normalize(num: number): string {
  if (typeof num === 'undefined' || typeof num !== 'number') return '';
  return num.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

export function trimArray(arr: Array<string>) {
  let trimmed: Array<string> = [];
  if (arr.length > 10) {
    const len = arr.length - 10;
    trimmed = arr.slice(0, 10);
    arr.push(`${len} more...`);
  }
  return trimmed;
}

export async function LoadEvents(searchy: Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();

    recursive('./eventybois', async (err, files) => {
      if (err) {
        console.log(`Error while reading events:\n${err}`);
        return reject(err);
      }

      const jsfiles = files.filter((fileName) => fileName.endsWith('.js') && !path.basename(fileName).startsWith('_'));
      if (jsfiles.length < 1) {
        console.log('No events to load!');
        return reject(new Error('No events!'));
      }

      console.log(`Found ${jsfiles.length} events`);

      // eslint-disable-next-line no-restricted-syntax
      for (const filePath of jsfiles) {
        const strt = process.hrtime.bigint();

        // eslint-disable-next-line no-await-in-loop
        const props = await import(`./${filePath}`);

        searchy.eventybois.set(props.default.name, props.default);

        const end = process.hrtime.bigint();
        const took = (end - strt) / BigInt('1000000');

        console.log(`${normalize(jsfiles.indexOf(filePath) + 1)} - ${filePath} loaded in ${took}ms`);
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
        console.log(`Error while reading commands:\n${err}`);
        return reject(err);
      }

      const jsfiles = files.filter((fileName) => fileName.endsWith('.js') && !path.basename(fileName).startsWith('_'));
      if (jsfiles.length < 1) {
        console.log('No commands to load!');
        return reject(new Error('No commmands'));
      }

      console.log(`Found ${jsfiles.length} commands`);

      // eslint-disable-next-line no-restricted-syntax
      for (const filePath of jsfiles) {
        const cmdStart = process.hrtime.bigint();

        // eslint-disable-next-line no-await-in-loop
        const props: Command = await import(`./${filePath}`);

        searchy.slashybois.set(props.data.name, props);

        const cmdEnd = process.hrtime.bigint();
        const took = (cmdEnd - cmdStart) / BigInt('1000000');

        console.log(`${normalize(jsfiles.indexOf(filePath) + 1)} - ${filePath} loaded in ${took}ms`);
      }

      const end = process.hrtime.bigint();
      const took = (end - start) / BigInt('1000000');
      console.log(`All commands loaded in \`${took}ms\``);

      resolve();
    });
  });
}

export async function DeployCommands(searchy: Client): Promise<void | boolean> {
  const data = [];
  // eslint-disable-next-line no-restricted-syntax
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

    const globalfilter = data.map((x) => x.options)
      .filter((x) => x !== undefined && (x as unknown as boolean) !== Array.isArray(x) && x.length);
    const localfilter = globalcmds.map((x) => x.options)
      .filter((x) => x !== undefined && (x as unknown as boolean) !== Array.isArray(x) && x.length);

    const globallocalhash = Md5((JSON.stringify(globalfilter)));
    const globalhash = Md5((JSON.stringify(localfilter)));

    if (globallocalhash !== globalhash) await searchy.application?.commands.set(data);
    return console.log('Application Commands deployed!');
  }

  if (searchy.user?.id === process.env.DEV_CLIENT_ID) {
    await searchy.guilds.cache.get(process.env.DEV_GUILD_ID as Snowflake)?.commands.set(data);
    return console.log('Application Commands deployed!');
  }
}
