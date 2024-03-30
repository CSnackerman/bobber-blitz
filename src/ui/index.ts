import { setupUI_debug, updateUI_debug } from './ui_debug';
import { setupUI_fishHealth, updateUI_fishHealth } from './ui_fish_health';
import { setupUI_fishOn, updateUI_fishOn } from './ui_fish_on';
import { setupUI_lineTension, updateUI_lineTension } from './ui_line_tension';

export function setupUI() {
  setupUI_fishOn();
  setupUI_lineTension();
  setupUI_fishHealth();
  setupUI_debug();
}

export function updateUI() {
  updateUI_fishOn();
  updateUI_lineTension();
  updateUI_fishHealth();
  updateUI_debug();
}
