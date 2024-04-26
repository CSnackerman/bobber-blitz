import { Signals, receive } from '../core/state';
import { setupUI_debug, updateWatches } from '../debug/ui_debug';
import { isDev } from '../util/environment';
import {
  hideUI_fishOn,
  setupUI_fishOn,
  showUI_fishOn,
  updateUI_fishOn,
} from './ui_fish_on';
import {
  hideUI_fishStamina,
  setupUI_fishStamina,
  showUI_fishStamina,
  updateUI_fishStamina,
} from './ui_fish_stamina';
import {
  hideUI_lineTension,
  setupUI_lineTension,
  showUI_lineTension,
  updateUI_lineTension,
} from './ui_line_tension';
import { setupUI_prize } from './ui_prize';

const { RESET, CAST, BITE, HOOK, CATCH_FISH } = Signals;

export function setupUI() {
  setupUI_fishOn();
  setupUI_lineTension();
  setupUI_fishStamina();
  setupUI_prize();

  if (isDev()) setupUI_debug();

  setupReceivers();
}

function setupReceivers() {
  receive(RESET, () => {
    hideUI_fishStamina();
    hideUI_fishOn();
    hideUI_lineTension();
  });

  receive(CAST, () => {
    hideUI_fishStamina();
    hideUI_fishOn();
  });

  receive(BITE, () => {
    showUI_fishOn();
  });

  receive(HOOK, () => {
    hideUI_fishOn();
    showUI_fishStamina();
    showUI_lineTension();
  });

  receive(CATCH_FISH, () => {
    hideUI_fishStamina();
    hideUI_lineTension();
  });
}

export function updateUI() {
  updateUI_fishOn();
  updateUI_lineTension();
  updateUI_fishStamina();

  if (isDev()) {
    updateWatches();
  }
}
