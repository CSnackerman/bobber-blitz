import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { delta } from '../core/time';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getBobberPosition } from './bobber';
import { degToRad } from 'three/src/math/MathUtils.js';
import { getFishermanPosition } from './fisherman';
import {
  addListener_HOOK_FISH,
  dispatch_STATE_CHANGE,
} from '../events/event_manager';
import { getDirection } from '../util/vector';
import { createArrowHelper } from './debug_orbs';

let fish: Group;

let fishMixer: AnimationMixer;
let flopAction: AnimationAction;
let flopPlaybackSpeed = 2.5;

const swimSpeed = 30;

export type FishState = 'SWIMMING' | 'BEING_REELED' | 'FLOPPING' | 'IDLE';
let fishState: FishState = 'IDLE';

export const isBEING_REELED = () => fishState === 'BEING_REELED';
export const isSWIMMING = () => fishState === 'SWIMMING';
export const isFLOPPING = () => fishState === 'FLOPPING';
export const isIDLE = () => fishState === 'IDLE';

export const getFishState = () => fishState;

export function setFishState(s: FishState) {
  fishState = s;
  dispatch_STATE_CHANGE();
}

export function setFishState_FLOPPING() {
  setFishState('FLOPPING');
}
export function setFishState_SWIMMING() {
  setFishState('SWIMMING');
}
export function setFishState_BEING_REELED() {
  setFishState('BEING_REELED');
}
export function setFishState_IDLE() {
  setFishState('IDLE');
}

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  setRandomScale(2, 5);
  setFishPosition(new Vector3(0, 2, 50));

  setFishState_IDLE();
  sceneRoot.add(fish);

  // setup animation
  fishMixer = new AnimationMixer(fish);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, 'flop');
  flopAction = fishMixer.clipAction(clip);

  fishMixer.addEventListener('finished', () => {
    setFishState_IDLE();
    flopTimeoutId = null;
  });

  // event handlers
  addListener_HOOK_FISH(onHook);
}

export function updateFish() {
  fishMixer.update(delta * flopPlaybackSpeed);

  if (isIDLE()) {
    return;
  }

  if (isSWIMMING() || isBEING_REELED()) {
    if (swimDirectionChangeTimeoutId === null) {
      changeSwimDirections();
    }

    swimForward();
    return;
  }
}

export function showFish() {
  fish.visible = true;
}

export function hideFish() {
  fish.visible = false;
}

function setFlopPlaybackSpeed(s: number) {
  if (s <= 0) {
    console.info(
      `Warn: flopPlaybackSpeed cannot be negative. Value unchanged. (${flopPlaybackSpeed})`
    );
    return;
  }
  flopPlaybackSpeed = s;
}

let flopTimeoutId: NodeJS.Timeout | null = null;

export function flopRandomly() {
  if (flopTimeoutId !== null) return;

  const delay = getRandomInt(300, 3500);
  const speed = getRandomFloat(0.3, 3);
  const nFlops = getRandomInt(1, 10);

  flopTimeoutId = setTimeout(() => {
    setFlopPlaybackSpeed(speed);
    flopFish(nFlops);
  }, delay);
}

function flopFish(flopCount: number) {
  setFishState_FLOPPING();
  flopAction.reset();
  flopAction.play().repetitions = flopCount;
}

export function setFishPosition(p: Vector3) {
  fish.position.copy(p);
}

export function moveFishBelowBobber() {
  const b = getBobberPosition();
  fish.position.set(b.x, fish.position.y, b.z);
}

function setRandomScale(min: number, max: number) {
  const scale = getRandomFloat(min, max);
  fish.scale.set(scale, scale, scale);
}

function swimForward() {
  const v = new Vector3();
  fish.getWorldDirection(v);
  fish.position.addScaledVector(v, swimSpeed * delta);
}

let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;

function changeSwimDirections() {
  if (swimDirectionChangeTimeoutId !== null) return;

  const delay = getRandomInt(300, 1000);

  swimDirectionChangeTimeoutId = setTimeout(() => {
    if (isBEING_REELED()) {
      setDirectionRandomlyToward(45);
    } else {
      setDirectionRandomlyAway(180);
    }

    swimDirectionChangeTimeoutId = null;
  }, delay);
}

function setDirectionRandomlyAway(arc: number) {
  const direction = getDirection(getFishermanPosition(), getFishPosition());
  direction.setY(0);

  fish.setRotationFromAxisAngle(
    new Vector3(0, 1, 0),
    Math.atan2(direction.x, direction.z) +
      degToRad(getRandomFloat(-arc / 2, arc / 2))
  );

  const v = new Vector3();
  fish.getWorldDirection(v);

  // debug;
  const helper = createArrowHelper(new Vector3(0, 0, 0), v.normalize());
  helper.position.copy(fish.position);
  helper.position.y = 45;
}

function setDirectionRandomlyToward(arc: number) {
  const direction = getDirection(getFishPosition(), getFishermanPosition());
  direction.setY(0);

  fish.setRotationFromAxisAngle(
    new Vector3(0, 1, 0),
    Math.atan2(direction.x, direction.z) +
      degToRad(getRandomFloat(-arc / 2, arc / 2))
  );

  const v = new Vector3();
  fish.getWorldDirection(v);

  // debug;
  const helper = createArrowHelper(new Vector3(0, 0, 0), v.normalize());
  helper.position.copy(fish.position);
  helper.position.y = 45;
}

export function getFishPosition() {
  return fish.position.clone();
}

function onHook() {
  setFishState_SWIMMING();
  setDirectionRandomlyAway(0);
}
