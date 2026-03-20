import os from 'node:os';
import readline from 'node:readline';
import { navigation } from './navigation.js';
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
      const { directory, success } = await navigation(line.trim(), currentDir);

      currentDir = directory;

      if (success) {
        updatePrompt()
      } else {
        rl.prompt();
      }

    } catch (err) {
      console.log('Operation failed');

      rl.prompt();
    }
  });

  rl.on('close', () => {
    goodbye();
    process.exit(0)
  });

  rl.on('SIGINT', () => {
    rl.close()
  })
}