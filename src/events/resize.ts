import { renderer } from '../core/renderer';
import { camera, updateCamera } from '../scene/camera';

export function setupResizeHandler() {
  window.addEventListener('resize', resizeWindow);
}

function resizeWindow() {
  updateCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
