import { renderer } from '../core/renderer';
import { FishermanState, getFishermanState } from '../scene/fisherman';
import { getDeviceType } from '../util/device';
import { getSpan } from '../util/ui_util';

const template = document.getElementById(
  'template_debug'
) as HTMLTemplateElement;

const debug_div = template.content.querySelector('div') as HTMLDivElement;

export function setupUI_debug() {
  debug_div.innerHTML = getDebugInnerHtml();
  document.body.appendChild(debug_div);
}

let prevFishermanState: FishermanState = getFishermanState();

export function updateUI_debug() {
  if (prevFishermanState !== getFishermanState()) {
    prevFishermanState = getFishermanState();
    debug_div.innerHTML = getDebugInnerHtml();
  }
}

export function hideUI_fishOn() {
  debug_div.style.visibility = 'hidden';
}

export function showUI_fishOn() {
  debug_div.style.visibility = 'visible';
}

function getDebugInnerHtml() {
  return (
    `User Agent: ${getSpan(navigator.userAgent, 'yellow')} <br>` +
    `Device Type: ${getSpan(getDeviceType(), 'hotpink')} <br>` +
    `Device Pixel Ratio: ${getSpan(devicePixelRatio)} <br>` +
    `Renderer Pixel Ratio: ${getSpan(renderer.getPixelRatio())} <br> ` +
    `Fisherman State: ${getSpan(getFishermanState(), 'red')} <br>`
  );
}
