import { setupControls } from './controls';
import { updateTimeDelta } from './core/clock';
import { initFirebase } from './core/firebase';
import { renderer, setupRenderer } from './core/renderer';
import { Signals, emit } from './core/state';
import { updateDebug } from './debug/debug_orbs';
import { setupPointer } from './events/pointer';
import { setupResizeHandler } from './events/resize';
import { setupBoatAsync, updateBoat } from './scene/boat';
import { setupBobberAsync, updateBobber } from './scene/bobber';
import { camera, setupCamera } from './scene/camera';
import { setupClouds, updateCloud } from './scene/cloud';
import { setupFishAsync, updateFish } from './scene/fish';
import { setupFishermanAsync, updateFisherman } from './scene/fisherman';
import { setupFishingLineAsync, updateFishingLine } from './scene/fishing_line';
import { setupLights } from './scene/lights';
import { setupReticle, updateReticle } from './scene/reticle';
import { initScene, rootScene } from './scene/scene';
import { setupSky, updateSun } from './scene/sky';
import { setupWater, updateWater } from './scene/water';
import { setupUI, updateUI } from './ui';
import { setupStats, updateStats } from './ui/stats';
import { printEnv } from './util/environment';

import '/assets/styles/main.scss';

main().catch((e: Error) => {
  console.error(e);
});

async function main() {
  initFirebase();
  initScene();
  await loadModels();
  printEnv();
  setup();
  run();
}

async function loadModels() {
  await Promise.all([
    setupBoatAsync(),
    setupFishermanAsync(),
    setupFishingLineAsync(),
    setupBobberAsync(),
    setupFishAsync(),
  ]);
}

function setup() {
  setupRenderer();
  setupCamera();
  setupResizeHandler();
  setupPointer();
  setupReticle();
  setupControls();
  setupStats();
  setupSky();
  setupClouds();
  setupWater();
  setupLights();
  setupUI();

  emit(Signals.RESET);
}

function run() {
  requestAnimationFrame(run);
  updateTimeDelta();
  updateStats();
  updateWater();
  updateBoat();
  updateFisherman();
  updateFishingLine();
  updateBobber();
  updateFish();
  updateReticle();
  updateUI();
  updateCloud();
  updateSun();

  updateDebug();

  renderer.render(rootScene, camera);
}
