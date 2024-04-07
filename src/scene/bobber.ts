import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { delta, getElapsedTime } from '../core/time';
import { castPoint } from '../controls/cast';
import { getRandomInt } from '../util/random';
import { camera } from './camera';
import {
  ON_CASTING,
  ON_FISHING,
  ON_FISH_FIGHT,
  ON_FISH_ON,
  RESET,
  receive,
  transmit,
} from '../events/event_manager';

let bobber: Group;

let bobberMixer: AnimationMixer;
let plunkAnimAction: AnimationAction;

export async function setupBobberAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/bobber.glb');

  bobber = gltf.scene;

  sceneRoot.add(bobber);

  // setup animation
  bobberMixer = new AnimationMixer(bobber);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, 'plunk');
  plunkAnimAction = bobberMixer.clipAction(clip);

  bobberMixer.addEventListener('finished', () => {
    transmit(RESET);
  });

  // setup event handlers
  receive(RESET, () => {
    bobber.scale.set(2, 2, 2);
    bobber.position.x = 50;
    hideBobber();
    cancelBobberPlunk();
  });

  receive(ON_CASTING, () => {
    hideBobber();
    plopBobber();
    cancelBobberPlunk();
  });

  receive(ON_FISHING, () => {
    showBobber();
    setPlunkTimer();
  });

  receive(ON_FISH_FIGHT, () => {
    hideBobber();
    cancelBobberPlunk();
  });
}

export function getTopBobberPoint(): Vector3 {
  let p = new Vector3();
  bobber.getObjectByName('top_bobber')?.getWorldPosition(p);
  return p;
}

export function updateBobber() {
  bobberMixer.update(delta);

  // idle bob
  bobber.position.y = Math.sin(getElapsedTime() * 3.0) * 0.4;
}

export function plopBobber() {
  bobber.position.copy(castPoint);
}

export function showBobber() {
  bobber.visible = true;
}

export function hideBobber() {
  bobber.visible = false;
}

export function getBobberPosition() {
  return bobber.position;
}

function plunkBobber() {
  transmit(ON_FISH_ON);
  plunkAnimAction.reset();
  plunkAnimAction.play().repetitions = 3;
}

let plunkTimerId: NodeJS.Timeout;

export function setPlunkTimer() {
  clearTimeout(plunkTimerId);
  const min = 500;
  const max = 700;
  plunkTimerId = setTimeout(plunkBobber, getRandomInt(min, max));
}

export function cancelBobberPlunk() {
  clearTimeout(plunkTimerId);
  plunkAnimAction.stop();
  plunkAnimAction.reset();
}

export function getBobberScreenCoords() {
  const worldPosition = new Vector3();
  bobber.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}
