import { ACESFilmicToneMapping, WebGLRenderer } from 'three';
import { isMobile } from '../util/device';

export { renderer, setup as setupRenderer };

const renderer = new WebGLRenderer({
  canvas: document.getElementById('c') as HTMLCanvasElement,
  antialias: !isMobile(),
});

function setup() {
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
}
