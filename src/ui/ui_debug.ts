import { renderer } from '../core/renderer';
import { FishermanState, getFishermanState } from '../scene/fisherman';
import { getDeviceOrientation, getDeviceType } from '../util/device';
import { getSpan } from '../util/ui_util';

const template = document.getElementById(
  'template_debug'
) as HTMLTemplateElement;

const debug_div = template.content.querySelector('div') as HTMLDivElement;

export function setupUI_debug() {
  debug_div.innerHTML = getDebugInnerHtml();
  document.body.appendChild(debug_div);

  window.addEventListener('resize', forceUpdateUI_debug);
  screen.orientation.addEventListener('change', forceUpdateUI_debug);
}

let prevFishermanState: FishermanState = getFishermanState();

function forceUpdateUI_debug() {
  debug_div.innerHTML = getDebugInnerHtml();
}

export function updateUI_debug() {
  if (prevFishermanState !== getFishermanState()) {
    prevFishermanState = getFishermanState();
    debug_div.innerHTML = getDebugInnerHtml();
  }
}

export function hideUI_debug() {
  debug_div.style.visibility = 'hidden';
}

export function showUI_debug() {
  debug_div.style.visibility = 'visible';
}

function getDebugInnerHtml() {
  return (
    `User Agent: ${getSpan(navigator.userAgent, 'yellow')} <br>` +
    `Device Type: ${getSpan(getDeviceType(), 'hotpink')} <br>` +
    `Orientation: ${getSpan(getDeviceOrientation(), 'yellowgreen')} <br>` +
    `Device Pixel Ratio: ${getSpan(devicePixelRatio)} <br>` +
    `Renderer Pixel Ratio: ${getSpan(renderer.getPixelRatio())} <br> ` +
    `Window Size: ${getSpan(
      `${window.innerWidth}x${window.innerHeight}`
    )} <br> ` +
    `Fisherman State: ${getSpan(getFishermanState(), 'red')} <br>`
  );
}
