import * as fs from 'node:fs/promises';
import { resolvePath } from './commands/utils/pathResolver.js'
import { count } from './commands/count.js'

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

    default:
      console.log('No such option');
      return { directory: currentDir, success: false }
  }
}

export function up(currentDir) {
  return path.resolve(currentDir, '..')
}

export async function cd(currentDir, targetPath) {
  if (!targetPath) {
    console.log('Operation failed');

    return { directory: currentDir, success: false };
  }

  const newPath = resolvePath(currentDir, targetPath)

  try {
    const stat = await fs.stat(newPath);

    if (stat.isDirectory()) {
      return { directory: newPath, success: true };
    }

    console.log('Operation failed');

    return { directory: currentDir, success: false };
  } catch {
    console.log('Operation failed');

    return { directory: currentDir, success: false }
  }
}

export async function ls (currentDir) {
  try {
    const dirArray = await fs.readdir(currentDir, { withFileTypes: true })

    const folderArray = dirArray
      .filter((item) => item.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => `${item.name} [folder]`)

    const fileArray = dirArray
      .filter((item) => item.isFile())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => `${item.name} [file]`)

    const concatedArray = folderArray.concat(fileArray)
    concatedArray.forEach((item) => console.log(item))
  
    return { directory: currentDir, success: true }
  } catch {
    console.log('Operation failed');

    return { directory: currentDir, success: false 
    }
  }
}