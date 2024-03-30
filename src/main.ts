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
import { setupBobberAsync, updateBobber } from './scene/bobber';
import { setupFishAsync, updateFish } from './scene/fish';
import { setupUI, updateUI } from './ui';
import { initFirebase } from './core/firebase';
import { setupControls } from './controls';

main().catch((e: Error) => {
  console.error(e);
});

async function main() {
  initFirebase();
  await loadModels();
  init();
  run();
}

async function loadModels() {
  await Promise.all([
    setupBoatAsync(),
    setupFishermanAsync(),
    setupBobberAsync(),
    setupFishAsync(),
  ]);
}

function init() {
  setupRenderer();
  setupCamera();
  setupResizeHandler();
  setupPointerHandler();
  setupControls();
  setupStats();
  setupSky();
  setupWater();
  setupLights();
  setupUI();
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
  updateFish();
  postitionReticle();
  updateUI();

  updateDebug();

  renderer.render(sceneRoot, camera);
}
