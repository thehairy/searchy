export default {
  name: 'shardError',
  async run(error: Error, shardID: number): Promise<void> {
    console.log(
      `Shard \`${shardID}\` has encountered a connection error:\n\n${error}`
    );
  },
};
