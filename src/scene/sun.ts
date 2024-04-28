import { Color } from 'three';

const sunColor = new Color(0xfdffb5);
const sunRefelectionColor = new Color(0x00007f);

export function getSunColor() {
  return sunColor;
}

export function getSunReflectionColor() {
  return sunRefelectionColor;
}
