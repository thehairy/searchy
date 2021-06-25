export default {
  name: 'uncaughtException',
  process: true,
  async run(err: Error): Promise<void> {
    console.log(`Uncaught Exception:\`\`\`\n${err.stack}\n\`\`\``);
  },
};
