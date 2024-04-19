import { PerspectiveCamera } from 'three';
import { isMobile } from '../util/device';

export const camera = new PerspectiveCamera();

export function setupCamera() {
  // lens
  camera.fov = 80;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.near = 0.1;
  camera.far = 3000;

  // transform
  if (isMobile()) {
    camera.position.set(1, 75, 0);
    camera.lookAt(0, 75, 0);
    camera.translateZ(125);
    updateCamera();
  } else {
    camera.position.set(1, 75, 0);
    camera.lookAt(0, 75, 0);
    camera.translateZ(125);
    updateCamera();
  }

  camera.updateProjectionMatrix();
}

export function updateCamera() {
  const w = window.innerWidth;

  camera.position.z = -w / 20;
}
