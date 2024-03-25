import Stats from 'three/addons/libs/stats.module.js';

const stats = new Stats();

export function setupStats() {
  (stats.dom.firstChild as HTMLCanvasElement).style.cursor = 'default'
  document.body.appendChild(stats.dom);
}

export function updateStats() {
  stats.update();
}
