import * as fs from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { resolvePath } from './utils/pathResolver.js'
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';

const allowedAlgorithms = ['sha256', 'md5', 'sha512']

export async function hashCompare(currentDir, args) {
  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: 'string' },
        hash: { type: 'string' },
        algorithm: { type: 'string', default: 'sha256' },
      }
    })

    if (!values.input || !values.hash) {
      throw new Error()
    }

    if (!allowedAlgorithms.includes(values.algorithm)) {
      throw new Error()
    }

    const inputFile = resolvePath(currentDir, values.input)
    const hashedFile = resolvePath(currentDir, values.hash)

    await fs.stat(inputFile)
    await fs.stat(hashedFile)

    const hash = crypto.createHash(values.algorithm)

    await pipeline(
      createReadStream(inputFile),
      hash
    )

    const hashedInput = hash.digest('hex')

    let content = ''

    const fileForCheck = createReadStream(hashedFile)

    for await (const chunk of fileForCheck) {
      content += chunk.toString()
    }

    const expectedHash = content.trim().split(':')[1]?.trim()

    console.log(
      hashedInput.toLowerCase() === expectedHash.toLowerCase() 
      ? "OK" 
      : "MISMATCH"
    );

    return { directory: currentDir, success: true }
  } catch(e) {
    console.log('Operation failed')

    return { directory: currentDir, success: false }
  }
}