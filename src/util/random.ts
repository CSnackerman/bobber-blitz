import { Color } from 'three';

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getRandomColorHex() {
  const r = getRandomInt(0, 255);
  const g = getRandomInt(0, 255);
  const b = getRandomInt(0, 255);
  const color = new Color(`rgb(${r}, ${g}, ${b})`);

  return '#' + color.getHexString();
}

export function getRandomColor() {
  return new Color(getRandomInt(0, 16777216));
}
