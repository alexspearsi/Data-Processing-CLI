export function navigation(input, currentDir) {
  const [command, ...args] = input.split(' ');

  switch(command) {
    case 'up':
      return up(currentDir);
    default:
      console.log('No such option');
      return currentDir;
  }
}


export function up(currentDir) {
  const parentDir = path.resolve(currentDir, '..')
  return parentDir;
}