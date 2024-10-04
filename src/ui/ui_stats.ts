import Stats from 'three/addons/libs/stats.module.js';

const stats = new Stats();

export function setupStats() {
  stats.dom.id = 'stats';
  document.body.appendChild(stats.dom);
}

export function updateStats() {
  stats.update();
}
