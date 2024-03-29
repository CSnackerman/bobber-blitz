import { WebGLRenderer, ACESFilmicToneMapping } from 'three';

export const renderer = new WebGLRenderer({
  canvas: document.getElementById('c') as HTMLCanvasElement,
  antialias:
    navigator.userAgent.includes('Windows') ||
    navigator.userAgent.includes('Mac') ||
    navigator.userAgent.includes('Linux'),
});

export function setupRenderer() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
}
