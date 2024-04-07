import { renderer } from '../core/renderer';
import { STATE_CHANGE, receive } from '../events/event_manager';
import { getFishState } from '../scene/fish';
import { getFishermanState } from '../scene/fisherman';
import { getFishingLineState } from '../scene/fishing_line';
import { getDeviceOrientation, getDeviceType } from '../util/device';
import { getSpan } from '../util/ui_util';

const template = document.getElementById(
  'template_debug'
) as HTMLTemplateElement;

const debug_div = template.content.querySelector('div') as HTMLDivElement;

export function setupUI_debug() {
  debug_div.innerHTML = getDebugInnerHtml();
  document.body.appendChild(debug_div);

  receive(STATE_CHANGE, refreshUpdateUI_debug);
  window.addEventListener('resize', refreshUpdateUI_debug);
  screen.orientation.addEventListener('change', refreshUpdateUI_debug);
}

export function refreshUpdateUI_debug() {
  debug_div.innerHTML = getDebugInnerHtml();
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
    )} <br><br>` +
    `Fisherman State: ${getSpan(getFishermanState(), 'red')} <br>` +
    `Fishing Line State: ${getSpan(getFishingLineState(), 'orange')} <br>` +
    `Fish State: ${getSpan(getFishState(), 'pink')} <br>`
  );
}
