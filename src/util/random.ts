export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getRandomColorHex() {
  const max = 16777215;
  const randColor = getRandomInt(0, max);
  return '#' + randColor.toString(16);
}
