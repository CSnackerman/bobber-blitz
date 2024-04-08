import { setupControls } from './controls';
import { postitionReticle } from './controls/aim';
import { initFirebase } from './core/firebase';
import { renderer, setupRenderer } from './core/renderer';
import { updateTimeDelta } from './core/time';
import { RESET, transmit } from './events/event_manager';
import { setupPointerHandler } from './events/pointer';
import { setupResizeHandler } from './events/resize';
import { setupBoatAsync, updateBoat } from './scene/boat';
import { setupBobberAsync, updateBobber } from './scene/bobber';
import { camera, setupCamera, updateOrbitControls } from './scene/camera';
import { updateDebug } from './scene/debug_orbs';
import { setupFishAsync, updateFish } from './scene/fish';
import { setupFishermanAsync, updateFisherman } from './scene/fisherman';
import { updateFishingLine } from './scene/fishing_line';
import { setupLights } from './scene/lights';
import sceneRoot from './scene/scene';
import { setupSky } from './scene/sky';
import { setupWater, updateWater } from './scene/water';
import { setupUI, updateUI } from './ui';
import { setupStats, updateStats } from './ui/stats';

import '/assets/styles/main.scss';

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

  transmit(RESET);
}

function run() {
  requestAnimationFrame(run);
  updateTimeDelta();
  updateStats();
  updateOrbitControls();
  updateWater();
  updateBoat();
  updateFisherman();
  updateFishingLine();
  updateBobber();
  updateFish();
  postitionReticle();
  updateUI();

  updateDebug();

  renderer.render(sceneRoot, camera);
}
