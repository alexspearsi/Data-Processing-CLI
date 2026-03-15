import * as path from 'node:path';
import * as fs from 'node:fs/promises';

export async function navigation(input, currentDir) {
  const [command, ...args] = input.trim().split(' ');

  switch(command) {
    case 'up':
      return { directory: up(currentDir), success: true }

    case 'cd':
      return await cd(currentDir, args[0])

    default:
      console.log('No such option');
      return { dir: currentDir, success: false }
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

  const newPath = path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(currentDir, targetPath);

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