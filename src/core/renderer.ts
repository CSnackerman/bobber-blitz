import { ACESFilmicToneMapping, WebGLRenderer } from 'three';
import { isMobile } from '../util/device';

export const renderer = new WebGLRenderer({
  canvas: document.getElementById('c') as HTMLCanvasElement,
  antialias: isMobile() ? false : true,
});

export function setupRenderer() {
  renderer.setPixelRatio(devicePixelRatio > 2 ? 2 : devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
}
