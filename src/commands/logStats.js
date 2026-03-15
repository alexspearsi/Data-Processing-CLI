import * as fs from 'node:fs/promises'
import { resolvePath } from './utils/pathResolver.js'
import * as os from 'node:os';
import { Worker } from 'worker_threads';
import { createReadStream, createWriteStream } from 'node:fs';
import readline from 'node:readline'

export async function createLogStats(currentDir, input, inputPath, output, outputPath) {
  try {
    if (input !== '--input' || output !== '--output') {
      throw new Error()
    }

    const logsFile = resolvePath(currentDir, inputPath)
    const outputFile = resolvePath(currentDir, outputPath)
    
    await fs.stat(logsFile)

    const cpuCount = os.cpus().length;

    const rl = readline.createInterface({
      input: createReadStream(logsFile),
      crlfDelay: Infinity
    });

    const lines = [];

    for await (const line of rl) {
      lines.push(line);
    }

    const chunkSize = Math.ceil(lines.length / cpuCount);

    const workers = [];

    for (let i = 0; i < cpuCount; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;

      const chunk = lines.slice(start, end);

      const worker = new Worker(new URL('../workers/logWorker.js', import.meta.url))

      worker.postMessage(chunk)

      workers.push(worker)
    }

    const results = await Promise.all(workers.map((worker) => {
      return new Promise((resolve) => {
        worker.on('message', (msg) => resolve(msg))
      })
    }))

    const total = {
      total: 0,
      levels: {
        'INFO': 0,
        'WARN': 0,
        'ERROR': 0
      },
      status: {
        '2xx': 0,
        '3xx': 0,
        '4xx': 0,
        '5xx': 0
      },
      topPaths: [],
      avgResponseTimeMs: 0
    }
  
    const paths = {}

       let responseTimeSum = 0

    for (const result of results) {

      total.total += result.total

      total.levels.INFO += result.levels.INFO
      total.levels.WARN += result.levels.WARN
      total.levels.ERROR += result.levels.ERROR

      total.status['2xx'] += result.status['2xx']
      total.status['3xx'] += result.status['3xx']
      total.status['4xx'] += result.status['4xx']
      total.status['5xx'] += result.status['5xx']

      responseTimeSum += result.responseTimeSum

      for (const path in result.paths) {
        if (paths[path]) {
          paths[path]++;
        } else {
          paths[path] = 1;
        }
      }
    }

    total.avgResponseTimeMs = Number(responseTimeSum / total.total).toFixed(2)

    total.topPaths = Object.entries(paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([path, count]) => ({ path, count }))

    await fs.writeFile(
      outputFile,
      JSON.stringify(total)
    )

    return { directory: currentDir, success: true }
  } catch(e) {
    console.log(e);
    console.log('Operation failed')


    return { directory: currentDir, success: false }
  }
}