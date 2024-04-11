export function isDev() {
  return import.meta.env.MODE === 'development';
}

export function printEnv() {
  console.log('env', import.meta.env);
}
