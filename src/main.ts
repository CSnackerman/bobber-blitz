import '/assets/styles/main.scss';
import sceneRoot from './scene/scene';
import { setupBoatAsync, updateBoat } from './scene/boat';
import { setupLights } from './scene/lights';
import { camera, setupCamera, updateOrbitControls } from './scene/camera';
import { renderer, setupRenderer } from './core/renderer';
import { setupResizeHandler } from './events/resize';
import { setupStats, updateStats } from './ui/stats';
import { setupWater, updateWater } from './scene/water';
import { setupSky } from './scene/sky';
import { setupPointerHandler } from './events/pointer';
import { postitionReticle } from './controls/aim';
import { updateTimeDelta } from './core/time';
import { updateDebug } from './scene/debug';
import { setupFishermanAsync, updateFisherman } from './scene/fisherman';
import { setupCastHandler } from './controls/cast';
import { setupBobberAsync, updateBobber } from './scene/bobber';
// import { initFirebase } from './core/firebase';

main().catch((e: Error) => {
  console.error(e);
});

async function main() {
  // initFirebase();
  await loadModels();
  init();
  run();
}

async function loadModels() {
  await Promise.all([
    setupBoatAsync(),
    setupFishermanAsync(),
    setupBobberAsync(),
  ]);
}

function init() {
  setupRenderer();
  setupCamera();
  setupResizeHandler();
  setupPointerHandler();
  setupCastHandler();
  setupStats();
  setupSky();
  setupWater();
  setupLights();
}

function run() {
  requestAnimationFrame(run);
  updateTimeDelta();
  updateStats();
  updateOrbitControls();
  updateWater();
  updateBoat();
  updateFisherman();
  updateBobber();
  postitionReticle();

  updateDebug();

  renderer.render(sceneRoot, camera);
}
