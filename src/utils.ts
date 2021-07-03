/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable consistent-return */
import type { Client, Snowflake } from 'discord.js';
import {
  CommandInteraction,
  WebhookClient,
  Util,
  MessageEmbed,
} from 'discord.js';
import recursive from 'recursive-readdir';
import path from 'path';
import Md5 from 'md5';
import fetch from 'node-fetch';
import type { Command } from './@types/index';

const { log } = console;

// eslint-disable-next-line func-names
console.log = function (message: any, conly: boolean) {
  let url = process.env.LOG_WEBHOOK_URL;
  if (url && !conly) {
    url = url
      .replace('https://discordapp.com/api/webhooks/', '')
      .replace('https://discord.com/api/webhooks/', '');
    const split = url.split('/');
    if (split.length < 2) return;

    const client = new WebhookClient(split[0] as Snowflake, split[1]);

    // eslint-disable-next-line no-param-reassign
    if (message instanceof Error) message = message.stack ?? message.message;

    // eslint-disable-next-line eqeqeq
    if (typeof message == 'string') {
      // eslint-disable-next-line no-restricted-syntax
      for (const msg of Util.splitMessage(message, { maxLength: 1980 })) {
        client.send({ content: msg, username: 'Searchy-Logs' });
      }
    } else client.send({ embeds: [message], username: 'Searchy-Logs' });

    if (!(message instanceof MessageEmbed)) {
      // eslint-disable-next-line no-param-reassign
      message = message.replace(/`/g, '').trim();
    }
  }
  return log.apply(console, [message]);
};

export function fetchJSON(url: string): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (!url || typeof url !== 'string') return reject(new Error('No URL'));

    try {
      const res = await fetch(url);
      resolve(await res.json());
    } catch (e) {
      reject(e);
    }
  });
}

export function GenerateSnowflake(): string {
  let rv = '';
  const possible = '1234567890';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 19; i++)
    rv += possible.charAt(Math.floor(Math.random() * possible.length));
  return rv;
}

export function cleanBreaks(str: string): string {
  return str.replace(/\n\r/g, '');
}

export function normalize(num: number): string {
  if (typeof num === 'undefined' || typeof num !== 'number') return '';
  return num.toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
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

      const jsfiles = files.filter(
        (fileName) =>
          fileName.endsWith('.js') && !path.basename(fileName).startsWith('_')
      );
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

        console.log(
          `${normalize(
            jsfiles.indexOf(filePath) + 1
          )} - ${filePath} loaded in ${took}ms`,
          true
        );
      }

      const end = process.hrtime.bigint();
      const took = (end - start) / BigInt('1000000');
      console.log(`All events loaded in \`${took}ms\``, true);
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

      const jsfiles = files.filter(
        (fileName) =>
          fileName.endsWith('.js') && !path.basename(fileName).startsWith('_')
      );
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

        console.log(
          `${normalize(
            jsfiles.indexOf(filePath) + 1
          )} - ${filePath} loaded in ${took}ms`,
          true
        );
      }

      const end = process.hrtime.bigint();
      const took = (end - start) / BigInt('1000000');
      console.log(`All commands loaded in \`${took}ms\``, true);

      resolve();
    });
  });
}

export function delay(inputDelay: number): Promise<void> {
  // If the input is not a number, instantly resolve
  if (typeof inputDelay !== 'number') return Promise.resolve();
  // Otherwise, resolve after the number of milliseconds.
  return new Promise((resolve) => setTimeout(resolve, inputDelay));
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

    const globalfilter = data
      .map((x) => x.options)
      .filter(
        (x) =>
          x !== undefined &&
          (x as unknown as boolean) !== Array.isArray(x) &&
          x.length
      );
    const localfilter = globalcmds
      .map((x) => x.options)
      .filter(
        (x) =>
          x !== undefined &&
          (x as unknown as boolean) !== Array.isArray(x) &&
          x.length
      );

    const globallocalhash = Md5(JSON.stringify(globalfilter));
    const globalhash = Md5(JSON.stringify(localfilter));

    if (globallocalhash !== globalhash) {
      await searchy.application?.commands.set(data);
    }
    return console.log('Application Commands deployed!');
  }

  if (searchy.user?.id === process.env.DEV_CLIENT_ID) {
    await searchy.guilds.cache
      .get(process.env.DEV_GUILD_ID as Snowflake)
      ?.commands.set(data);
    return console.log('Application Commands deployed!');
  }
}

export async function CITest(searchy: Client): Promise<void> {
  console.log('Starting CI test');

  if (!searchy.options.http) return;

  // eslint-disable-next-line no-param-reassign
  searchy.options.http.api = 'https://gideonbot.com/api/dump';

  const tests = await import('./tests.js');

  const channel_id = GenerateSnowflake();
  const guild_id = GenerateSnowflake();

  const user = {
    id: searchy.owner,
    username: 'Test',
    discriminator: '0001',
    avatar: null,
    bot: false,
    system: false,
    flags: 64,
  };

  const member = {
    user,
    nick: null,
    roles: [],
    joined_at: new Date().toISOString(),
    deaf: false,
    mute: false,
  };

  searchy.guilds.add({
    name: 'Test',
    region: 'US',
    member_count: 2,
    large: false,
    features: [],
    embed_enabled: true,
    premium_tier: 0,
    verification_level: 1,
    explicit_content_filter: 1,
    mfa_level: 0,
    joined_at: new Date().toISOString(),
    default_message_notifications: 0,
    system_channel_flags: 0,
    id: guild_id,
    unavailable: false,
    roles: [
      {
        id: guild_id,
        name: '@everyone',
        color: 3447003,
        hoist: true,
        position: 1,
        permissions: 66321471,
        managed: false,
        mentionable: false,
      },
    ],
    members: [
      {
        user: searchy.user?.toJSON(),
        nick: null,
        roles: [],
        joined_at: new Date().toISOString(),
        deaf: false,
        mute: false,
      },
      member,
    ],
    owner_id: user.id,
  });

  searchy.channels.add({
    nsfw: false,
    name: 'test-channel',
    type: 0,
    guild_id,
    id: channel_id,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const item of tests.commands) {
    const interaction = new CommandInteraction(searchy, {
      type: 2,
      token: 'lol',
      id: GenerateSnowflake(),
      channel_id,
      guild_id,
      member,
      data: item,
    });

    searchy.emit('interaction', interaction);
  }

  // We need to wait for all requests to go through
  await delay(5e3);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log('Checking if all requests are over...');
    // eslint-disable-next-line no-underscore-dangle
    if (
      // @ts-ignore
      !searchy.rest.handlers
        .array()
        // @ts-ignore
        .map((x) => x._inactive)
        // @ts-ignore
        .some((x) => !x)
    )
      break;
    // eslint-disable-next-line no-await-in-loop
    await delay(2e3);
  }

  console.log('Run successful, exiting with code 0');
  searchy.destroy();
  process.exit();
}
