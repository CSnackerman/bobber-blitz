import { getCastState } from '../controls/cast';
import { CAST_CLOCK, getClock } from '../core/clock';
import { renderer } from '../core/renderer';
import { receive, Signals } from '../core/state';
import { getBobberState } from '../scene/bobber';
import { getFishState } from '../scene/fish';
import { getFishermanState } from '../scene/fisherman';
import { getFishingLineState } from '../scene/fishing_line';
import { getReticleState } from '../scene/reticle';
import { getDeviceOrientation, getDeviceType } from '../util/device';
import { getSpan } from '../util/ui_util';

const template = document.getElementById('template_debug') as HTMLTemplateElement;

const debug_div = template.content.querySelector('div') as HTMLDivElement;

export function setupUI_debug() {
  debug_div.style.fontFamily = 'monospace';
  debug_div.innerHTML = getDebugInnerHtml();
  document.body.appendChild(debug_div);

  receive(Signals.STATE_CHANGE, refreshUpdateUI_debug);
  window.addEventListener('resize', refreshUpdateUI_debug);
  screen.orientation.addEventListener('change', refreshUpdateUI_debug);

  setupWatches();
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

// prettier-ignore
function getDebugInnerHtml() {
  return (
    `User Agent: ${getSpan(navigator.userAgent, 'yellow').outerHTML} <br>` +
    `Device Type: ${getSpan(getDeviceType(), 'hotpink').outerHTML} <br>` +
    `Orientation: ${
      getSpan(getDeviceOrientation(), 'yellowgreen').outerHTML
    } <br>` +
    `Device Pixel Ratio: ${getSpan(devicePixelRatio).outerHTML} <br>` +
    `Renderer Pixel Ratio: ${
      getSpan(renderer.getPixelRatio()).outerHTML
    } <br> ` +
    `Window Size: ${
      getSpan(`${window.innerWidth} x ${window.innerHeight}`).outerHTML
    } <br><br>` +

    `Fisherman.... ${getSpan(getFishermanState(), 'springgreen').outerHTML} <br>` +
    `Cast......... ${getSpan(getCastState(), 'yellow').outerHTML} <br>` +
    `Bobber....... ${getSpan(getBobberState(), 'greenyellow').outerHTML} <br>` +
    `Fishing Line. ${getSpan(getFishingLineState(), 'orange').outerHTML} <br>` +
    `Fish......... ${getSpan(getFishState(), 'pink').outerHTML} <br>` +
    `Reticle...... ${getSpan(getReticleState(), 'lightgreen').outerHTML} <br>`
  );
}

interface Watch {
  name: string;
  value: string;
  update?: () => void;
}

const watches: Watch[] = [];
const watchesDiv = document.createElement('div');

export function addWatch(watch: Watch) {
  if (!watch.update) {
    watch.update = function () {};
  }
  watches.push(watch);
}

export function updateWatches() {
  let text = '';
  for (const watch of watches) {
    watch.update?.();
    text += `${watch.name}: ${watch.value}\n`;
  }
  watchesDiv.textContent = text;
}

function setupWatches() {
  watchesDiv.id = 'watches';
  document.body.appendChild(watchesDiv);

  // Cast Clock
  addWatch({
    name: 'Cast Clock',
    value: '0.000',
    update: function () {
      const c = getClock(CAST_CLOCK);

      if (!c.running) return;

      this.value = c.getElapsedTime().toFixed(3);
    },
  });

  updateWatches();
}
