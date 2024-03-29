import { setupUI_debug, updateUI_debug } from './ui_debug';
import { setupUI_fishOn, updateUI_fishOn } from './ui_fish_on';

export function setupUI() {
  setupUI_fishOn();
  setupUI_debug();
}

export function updateUI() {
  updateUI_fishOn();
  updateUI_debug();
}
