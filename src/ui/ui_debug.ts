import { renderer } from '../core/renderer';

const template = document.getElementById(
  'template_debug'
) as HTMLTemplateElement;

const debug_div = template.content.querySelector('div') as HTMLDivElement;

export function setupUI_debug() {
  debug_div.innerHTML =
    `Device Pixel Ratio: ${window.devicePixelRatio}` +
    `<br> Renderer Pixel Ratio: ${renderer.getPixelRatio().toFixed(2)}`;
  document.body.appendChild(debug_div);
}

export function updateUI_debug() {}

export function hideUI_fishOn() {
  debug_div.style.visibility = 'hidden';
}

export function showUI_fishOn() {
  debug_div.style.visibility = 'visible';
}
