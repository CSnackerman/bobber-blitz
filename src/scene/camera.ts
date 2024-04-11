import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { renderer } from '../core/renderer';

export const camera = new PerspectiveCamera();

export function setupCamera() {
  // lens
  camera.fov = 80;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.near = 0.1;
  camera.far = 3000;

  // transform
  // camera.position.set(100, 100, 250);
  camera.position.set(50, 150, 50);
  camera.updateProjectionMatrix();

  setupOrbitControls();
}

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

function setupOrbitControls() {
  // controls.autoRotate = true;
  controls.autoRotateSpeed = 0.15;
  // controls.enablePan = false;
  // controls.enableRotate = false;
  // controls.enableZoom = false;
  controls.target.set(0, 0, 0);
}

export function updateOrbitControls() {
  if (camera.position.y <= 3) camera.position.setY(3);
  controls.update();
}
