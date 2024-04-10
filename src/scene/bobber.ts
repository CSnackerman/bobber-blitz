import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { castPoint } from '../controls/cast';
import { Signals, observe, propagate } from '../core/state';
import { delta, getElapsedTime } from '../core/time';
import { getRandomInt } from '../util/random';
import { camera } from './camera';
import { rootScene } from './scene';

export {
  getPosition as getBobberPosition,
  getScreenCoords as getBobberScreenCoords,
  getTopPoint as getBobberTopPoint,
  setup as setupBobberAsync,
  update as updateBobber,
};

/* Initialization */

let bobber: Group;

async function setup() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/bobber.glb');

  bobber = gltf.scene;

  rootScene.add(bobber);

  setupAnimation(gltf);

  setupObservers();
}

const { RESET, ON_CAST, ON_FISHING, ON_FISH_OFFENSE, ON_FISH_ON } = Signals;

function setupObservers() {
  observe(RESET, () => {
    bobber.scale.set(2, 2, 2);
    bobber.position.x = 50;
    hide();
    cancelPlunk();
  });

  observe(
    ON_CAST,
    () => {
      cancelPlunk();
      hide();
      moveToCastPoint();
    },
    2 // prio
  );

  observe(ON_FISHING, () => {
    show();
    setPlunkTimer();
  });

  observe(ON_FISH_OFFENSE, () => {
    hide();
    cancelPlunk();
  });
}

function update() {
  animationMixer.update(delta);

  // idle bob
  bobber.position.y = Math.sin(getElapsedTime() * 3.0) * 0.4;
}

/* Animation */
let animationMixer: AnimationMixer;
let plunkAnimationAction: AnimationAction;
let plunkTimerId: NodeJS.Timeout;

function setupAnimation(gltf: GLTF) {
  animationMixer = new AnimationMixer(bobber);
  animationMixer.addEventListener('finished', () => propagate(RESET));

  setupAnimation_Plunk(gltf);
}

function setupAnimation_Plunk(gltf: GLTF) {
  plunkAnimationAction = animationMixer.clipAction(
    AnimationClip.findByName(gltf.animations, 'plunk')
  );
}

function plunk() {
  propagate(ON_FISH_ON);
  plunkAnimationAction.reset();
  plunkAnimationAction.play().repetitions = 3;
}

function setPlunkTimer() {
  clearTimeout(plunkTimerId);
  const delay = getRandomInt(500, 700);
  plunkTimerId = setTimeout(plunk, delay);
}

function cancelPlunk() {
  clearTimeout(plunkTimerId);
  plunkAnimationAction.stop();
  plunkAnimationAction.reset();
}

/* Transformation */

function getTopPoint() {
  let p = new Vector3();
  bobber.getObjectByName('top_bobber')?.getWorldPosition(p);
  return p;
}

function getPosition() {
  return bobber.position;
}

function moveToCastPoint() {
  bobber.position.copy(castPoint);
}

function getScreenCoords() {
  const worldPosition = new Vector3();
  bobber.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}

function show() {
  bobber.visible = true;
}

function hide() {
  bobber.visible = false;
}
