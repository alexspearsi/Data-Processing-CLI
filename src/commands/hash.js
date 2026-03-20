import * as fs from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { resolvePath } from './utils/pathResolver.js'
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';
import path from 'node:path'

const allowedAlgorithms = ['sha256', 'md5', 'sha512']

export async function hash(currentDir, args) {
  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: 'string' },
        algorithm: { type: 'string', default: 'sha256' },
        save: { type: 'boolean' }
      }
    })

    if (!values.input) {
      throw new Error()
    }

    if (!allowedAlgorithms.includes(values.algorithm)) {
      throw new Error()
    }

    const file = resolvePath(currentDir, values.input)

    const hashedFile = path.join(
      path.dirname(file),
      `${path.basename(file)}.${values.algorithm}`
    )
    
    await fs.stat(file)

    const hash = crypto.createHash(values.algorithm)

    await pipeline(
      createReadStream(file),
      hash
    )

    const hashed = hash.digest('hex')

    if (values.save) {
      await fs.writeFile(hashedFile, `${values.algorithm}: ${hashed}`)
    }

    console.log(`${values.algorithm}: ${hashed}`);

    return { directory: currentDir, success: true }
  } catch(e) {
    console.log('Operation failed')

    return { directory: currentDir, success: false }
  }
}