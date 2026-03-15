import * as fs from 'node:fs/promises'
import { resolvePath } from './utils/pathResolver.js'
import { createReadStream, createWriteStream } from 'node:fs';
import readline from 'node:readline'

export async function convertCSVtoJSON(currentDir, input, inputPath, output, outputPath) {
  try {
    if (input !== '--input' || output !== '--output') {
      throw new Error()
    }

    const csvFile = resolvePath(currentDir, inputPath)
    const jsonFile = resolvePath(currentDir, outputPath)

    await fs.stat(csvFile)

    const readStream = createReadStream(csvFile)
    const writeStream = createWriteStream(jsonFile)

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    })

    let headers = []
    let isFirstObjInArray = true

    writeStream.write('[')

    for await (const line of rl) {
      if (!headers.length) {
        headers = line.split(',')
        continue
      }

      const values = line.split(',')
      const obj = {}

      headers.forEach((header, index) => {
        obj[header] = values[index]
      })

      if (!isFirstObjInArray) {
        writeStream.write(',')
      }

      writeStream.write(JSON.stringify(obj))
      isFirstObjInArray = false
    }

    writeStream.end(']')

    return { directory: currentDir, success: true }
  } catch {
    console.log('Operation failed')

    return { directory: currentDir, success: false }
  }
}