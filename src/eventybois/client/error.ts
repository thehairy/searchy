export default {
  name: 'error',
  async run(err: Error): Promise<void> {
    console.log(`Bot error:\n${err.stack}`);
  },
};
