import os from 'node:os';
import readline from 'node:readline';
import { goodbye } from './commands/utils/output.js';

export function startRepl() {
  let currentDir = os.homedir();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function updatePrompt() {
    console.log(`You are currently in ${currentDir}`);

    rl.setPrompt('> ');
    rl.prompt();
  }

  updatePrompt();

  rl.on('line', async (line) => {
    try {
      currentDir = await fileManager(line.trim(), currentDir);

      updatePrompt();
    } catch (err) {
      console.log(`\x1b[31mOperation failed :(\x1b[0m \nReason: [${err.message || err}] \n`);

      rl.prompt();
    }
  });

  rl.on('close', () => {
    goodbye();
    process.exit(0)
  });

  rl.on('SIGINT', () => {
    goodbye();
    rl.close()
  })
}