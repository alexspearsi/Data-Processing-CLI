import * as path from 'node:path';

export function resolvePath(currentDir, targetPath) {
  return path.isAbsolute(targetPath)
      ? targetPath
      : path.resolve(currentDir, targetPath);
}