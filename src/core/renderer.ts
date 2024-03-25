import { WebGLRenderer, ACESFilmicToneMapping } from 'three';

export const renderer = new WebGLRenderer({
  antialias:
    navigator.userAgent.includes('Windows') ||
    navigator.userAgent.includes('Mac') ||
    navigator.userAgent.includes('Linux'),
});

export function setupRenderer() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);
}
