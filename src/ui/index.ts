import { Signals, receive } from '../core/state';
import { setupUI_debug, updateWatches } from '../debug/ui_debug';
import { isDev } from '../util/environment';
import { setupUI_prize } from './ui_prize';

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

const { RESET, CAST, BITE, HOOK, CATCH_FISH } = Signals;

export function setupUI() {
  setupUI_lineTension();
  setupUI_fishStamina();
  setupUI_prize();

  if (isDev()) setupUI_debug();

  setupReceivers();
}

function setupReceivers() {
  receive(RESET, () => {
    hideUI_fishStamina();
    hideUI_lineTension();
  });

  receive(CAST, () => {
    hideUI_fishStamina();
  });

  receive(BITE, () => {});

  receive(HOOK, () => {
    showUI_fishStamina();
    showUI_lineTension();
  });

  receive(CATCH_FISH, () => {
    hideUI_fishStamina();
    hideUI_lineTension();
  });
}

export function updateUI() {
  updateUI_lineTension();
  updateUI_fishStamina();

  if (isDev()) {
    updateWatches();
  }
}
