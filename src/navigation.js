import { cd, up, ls } from './commands/fileSystem.js' 
import { count } from './commands/count.js'
import { convertCSVtoJSON } from './commands/csvToJson.js'
import { convertJSONtoCSV } from './commands/jsonToCsv.js'
import { createLogStats } from './commands/logStats.js'
import { hash } from './commands/hash.js'
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js'

export async function navigation(input, currentDir) {
  const [command, ...args] = input.trim().split(' ');

  switch(command) {
    case 'up':
      return { directory: up(currentDir), success: true }

    case 'cd':
      return await cd(currentDir, args[0])

    case 'ls':
      return await ls(currentDir)

    case 'count':
      return await count(currentDir, args[0], args[1])

    case 'csv-to-json':
      return await convertCSVtoJSON(currentDir, ...args)

    case 'json-to-csv':
      return await convertJSONtoCSV(currentDir, ...args)

    case 'log-stats':
      return await createLogStats(currentDir, ...args)

    case 'hash':
      return await hash(currentDir, args)

    case 'hash-compare':
      return await hashCompare(currentDir, args)

    case 'encrypt':
      return await encrypt(currentDir, args)

    default:
      console.log('Invalid input');
      return { directory: currentDir, success: false }
  }
}
