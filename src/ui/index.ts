import { Signals, receive } from '../core/state';
import { setupUI_debug } from './ui_debug';
import {
  hideUI_fishHealth,
  setupUI_fishHealth,
  showUI_fishHealth,
  updateUI_fishHealth,
} from './ui_fish_health';
import {
  hideUI_fishOn,
  setupUI_fishOn,
  showUI_fishOn,
  updateUI_fishOn,
} from './ui_fish_on';
import {
  hideUI_lineTension,
  setupUI_lineTension,
  showUI_lineTension,
  updateUI_lineTension,
} from './ui_line_tension';
import { setupUI_prize, updateUI_prize } from './ui_prize';

const { RESET, CAST, ON_FISH_ON, ON_FISH_OFFENSE } = Signals;

function setupReceivers() {
  receive(RESET, () => {
    hideUI_fishHealth();
    hideUI_fishOn();
    hideUI_lineTension();
  });

  receive(CAST, () => {
    hideUI_fishHealth();
    hideUI_fishOn();
  });

  receive(ON_FISH_ON, () => {
    showUI_fishOn();
  });

  receive(ON_FISH_OFFENSE, () => {
    hideUI_fishOn();
    showUI_fishHealth();
    showUI_lineTension();
  });
}

export function setupUI() {
  setupUI_fishOn();
  setupUI_lineTension();
  setupUI_fishHealth();
  setupUI_prize();
  setupUI_debug();

  setupReceivers();
}

export function updateUI() {
  updateUI_fishOn();
  updateUI_lineTension();
  updateUI_fishHealth();
  updateUI_prize();
}
