import { Vector3 } from 'three';
import { delta } from '../core/time';
import { lerp } from 'three/src/math/MathUtils.js';

// dom
const template = document.getElementById(
  'template_line_tension'
) as HTMLTemplateElement;
const lineTension_div = template.content.getElementById(
  'line_tension'
) as HTMLDivElement;
const lineTensionBar_div = template.content.getElementById(
  'line_tension_bar'
) as HTMLDivElement;

// --

let alpha = 0.0;

export function setupUI_lineTension() {
  document.body.appendChild(lineTension_div);
  updateBarColor();
  updateBarProgress();
}

export function updateUI_lineTension() {
  updateAlpha(0.1);
  updateBarColor();
  updateBarProgress();
  if (alpha > 1) resetAlpha();
}

function updateAlpha(rate: number) {
  alpha += rate * delta;
}

function resetAlpha() {
  alpha = 0.0;
}

function updateBarColor() {
  const barStyle = lineTensionBar_div.style;
  const colorStart = new Vector3(0, 255, 50);
  const colorEnd = new Vector3(255, 0, 0);
  const color = colorStart.lerp(colorEnd, alpha);
  barStyle.backgroundColor = `rgb(${color.x}, ${color.y}, ${color.z})`;
}

function updateBarProgress() {
  const barStyle = lineTensionBar_div.style;
  const start = 0;
  const end = 100;
  const progress = lerp(start, end, alpha);
  barStyle.height = `${progress}%`;
}

export function hideUI_lineTension() {
  lineTension_div.style.visibility = 'hidden';
}

export function showUI_lineTension() {
  lineTension_div.style.visibility = 'visible';
}
