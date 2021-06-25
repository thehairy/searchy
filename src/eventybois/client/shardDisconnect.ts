import type { CloseEvent } from 'discord.js';

export default {
  name: 'shardDisconnect',
  async run(event: CloseEvent, id: string): Promise<void> {
    console.log(
      `Shard ${id} disconnected:\n\nCode: ${event.code}\nReason: ${event.reason}`
    );
  },
};
