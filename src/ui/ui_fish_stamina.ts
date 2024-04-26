import { Vector3 } from 'three';
import { clamp, lerp } from 'three/src/math/MathUtils.js';
import {
  getFishDistanceFromFisherman,
  getFishScreenCoords,
} from '../scene/fish';

// dom
const template = document.getElementById(
  'template_fish_health'
) as HTMLTemplateElement;
const fishHealth_div = template.content.getElementById(
  'fish_health'
) as HTMLDivElement;
const fishHealthBar_div = template.content.getElementById(
  'fish_health_bar'
) as HTMLDivElement;

// --

let alpha = 0.0;
let baseWidth: number;
let baseHeight: number;

export function setupUI_fishStamina() {
  document.body.appendChild(fishHealth_div);
  updateBarColor();
  updateBarProgress();
  hideUI_fishStamina();

  const rect = fishHealth_div.getBoundingClientRect();
  baseWidth = rect.width;
  baseHeight = rect.height;

  resetAlpha();
}

export function updateUI_fishStamina() {
  updateBarColor();
  updateBarProgress();
  if (alpha > 1) resetAlpha();

  const rect = fishHealth_div.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // position over fish
  const fishPosition = getFishScreenCoords();
  fishHealth_div.style.top = `${fishPosition.y - height * 7}px`;
  fishHealth_div.style.left = `${fishPosition.x - width / 2}px`;

  // scale by distance
  const dist = getFishDistanceFromFisherman();
  const normalizedDist = (dist - 10) * ((1.2 - 0.8) / (200 - 10)) + 0.8;
  fishHealth_div.style.width = `${baseWidth / normalizedDist}px`;
  fishHealth_div.style.height = `${baseHeight / normalizedDist}px`;
}

function resetAlpha() {
  alpha = 1.0;
}

export function setStamina(percent: number) {
  percent = clamp(percent, 0, 100);
  alpha = parseFloat((percent / 100.0).toFixed(2));
}

function updateBarColor() {
  const barStyle = fishHealthBar_div.style;
  const colorStart = new Vector3(255, 0, 0);
  const colorEnd = new Vector3(0, 255, 50);
  const color = colorStart.lerp(colorEnd, alpha);
  barStyle.backgroundColor = `rgb(${color.x}, ${color.y}, ${color.z})`;
}

function updateBarProgress() {
  const barStyle = fishHealthBar_div.style;
  const start = 0;
  const end = 100;
  const progress = lerp(start, end, alpha);
  barStyle.width = `${progress}%`;
}

export function hideUI_fishStamina() {
  fishHealth_div.style.visibility = 'hidden';
}

export function showUI_fishStamina() {
  fishHealth_div.style.visibility = 'visible';
}
