import { createReadStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import { resolvePath } from './utils/pathResolver.js'

export async function count (currentDir, arg, targetPath) {
  try {
    if (arg !== '--input') {
      throw new Error()
    }
    
    const newPath = resolvePath(currentDir, targetPath)

    await fs.stat(newPath)

    let text = '';

    const stream = createReadStream(newPath, { encoding: 'utf8' });

    for await (const chunk of stream) {
      text += chunk
    }

    const objTextDis = {
      lines: text.split('\n').length,
      words: text.trim().split(/\s+/g).length,
      characters: text.split('').length,
    }

    console.log(`Lines: ${objTextDis.lines}\nWords: ${objTextDis.words}\nCharacters: ${objTextDis.characters}`);

    return { directory: currentDir, success: true }

  } catch {
    console.log('Operation failed');

    return { directory: currentDir, success: false }
  }
}