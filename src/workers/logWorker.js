import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  const arrayOfObjStat = data.map(getObjStat);

  const result = {
    total: 0,
    levels: {
      INFO: 0,
      WARN: 0,
      ERROR: 0
    },
    status: {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0
    },
    paths: {},
    responseTimeSum: 0
  };

  arrayOfObjStat.forEach(({ level, statusCode, responseTimeMs, path }) => {
    result.total++;

    if (result.levels[level] !== undefined) {
      result.levels[level]++;
    }

    result.responseTimeSum += Number(responseTimeMs);

    if (result.paths[path]) {
      result.paths[path]++;
    } else {
      result.paths[path] = 1;
    }

    const status = statusCode[0] + 'xx';

    if (result.status[status] !== undefined) {
      result.status[status]++;
    }

  });

  parentPort.postMessage(result);
});

function getObjStat(line) {

  const [
    timestamp,
    level,
    service,
    statusCode,
    responseTimeMs,
    method,
    path
  ] = line.split(' ');

  return {
    timestamp,
    level,
    service,
    statusCode,
    responseTimeMs,
    method,
    path
  };
}