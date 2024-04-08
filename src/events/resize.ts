import { renderer } from '../core/renderer';
import { camera } from '../scene/camera';

export function setupResizeHandler() {
  window.addEventListener('resize', resizeWindow);
}

function resizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
