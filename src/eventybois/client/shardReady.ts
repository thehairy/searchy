export default {
  name: 'shardReady',
  async run(id: number, unavailableGuilds: Set<string>): Promise<void> {
    if (!unavailableGuilds) console.log(`Shard \`${id}\` is connected!`);
    else
      console.log(
        `Shard ${id} is connected!\n\nThe following guilds are unavailable due to a server outage:\n\n${Array.from(
          unavailableGuilds
        ).join('\n')}`
      );
  },
};
