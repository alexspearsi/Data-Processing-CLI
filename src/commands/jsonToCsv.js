import * as fs from 'node:fs/promises'
import { resolvePath } from './utils/pathResolver.js'
import { createReadStream, createWriteStream } from 'node:fs';
import readline from 'node:readline'

export async function convertJSONtoCSV(currentDir, input, inputPath, output, outputPath) {
  try {
    if (input !== '--input' || output !== '--output') {
      throw new Error()
    }

    const jsonFile = resolvePath(currentDir, inputPath)
    const csvFile = resolvePath(currentDir, outputPath)

    await fs.stat(jsonFile)

    const readStream = createReadStream(jsonFile);
    const writeStream = createWriteStream(csvFile);

    let data = ''

    for await (const chunk of readStream) {
      data += chunk.toString()
    }

    const array = JSON.parse(data)

    const headers = Object.keys(array[0])

    writeStream.write(headers.join(',') + '\n')

    for (const obj of array) {
      const row =  headers.map(header => obj[header]).join(',')

      writeStream.write(row + '\n')
    }

    writeStream.end()

    return { directory: currentDir, success: true }
  } catch {
    console.log('Operation failed')

    return { directory: currentDir, success: false }
  }
}