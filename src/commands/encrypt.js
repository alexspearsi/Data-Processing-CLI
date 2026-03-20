import * as fs from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { resolvePath } from './utils/pathResolver.js'
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';

export async function encrypt(currentDir, args) {
  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: 'string' },
        output: { type: 'string'},
        password: { type: 'string' }
      }
    })

    if (!values.input || !values.output || !values.password) {
      throw new Error()
    }

    const inputFile = resolvePath(currentDir, values.input) 
    const outputFile = resolvePath(currentDir, values.output) 
    
    await fs.stat(inputFile)

    const salt = crypto.randomBytes(16)
    const iv = crypto.randomBytes(12)

    const key = crypto.scryptSync(values.password, salt, 32)
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    const readStream = createReadStream(inputFile)
    const writeStream = createWriteStream(outputFile)

    writeStream.write(salt)
    writeStream.write(iv)

    await pipeline(
      readStream,
      cipher,
      writeStream
    )
    
    const tag = cipher.getAuthTag()

    await fs.appendFile(outputFile, tag)

    writeStream.end();

    return { directory: currentDir, success: true }
  } catch(e) {
    console.log(e);

    console.log('Operation failed')

    return { directory: currentDir, success: false }
  }
}