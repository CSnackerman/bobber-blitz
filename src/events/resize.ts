import { camera } from "../scene/camera";
import { renderer } from "../core/renderer";

function resizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function setupResizeHandler() {
  window.addEventListener("resize", resizeWindow);
}
