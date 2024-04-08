import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Euler,
  Group,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { State } from '../core/state';
import { delta } from '../core/time';
import {
  ON_FISHERMAN_FIGHT,
  ON_FISH_CAUGHT,
  ON_FISH_FIGHT,
  RESET,
  receive,
  transmit,
} from '../events/event_manager';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getDirection } from '../util/vector';
import { getBobberPosition } from './bobber';
import { getFishermanPosition } from './fisherman';
import sceneRoot from './scene';

/* Initialization */
let fish: Group;

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  sceneRoot.add(fish);

  setupAnimation(gltf);

  setupReceivers();
}

/* State */

enum FishStates {
  IDLE = 'IDLE',
  SWIMMING = 'SWIMMING',
  BEING_REELED = 'BEING_REELED',
  FLOPPING = 'FLOPPING',
}
const { IDLE, SWIMMING, BEING_REELED, FLOPPING } = FishStates;

let state = new State<FishStates>(IDLE, null);

export const getFishState = () => state.get();

export function updateFish() {
  state.update();
}

function setupReceivers() {
  receive(ON_FISH_FIGHT, () => {
    cancelChangeSwimDirections();
    moveBelowBobber();
    setSwimDirection_AwayFisherman();
    changeSwimDirectionCallback = setSwimDirection_AwayFisherman;

    state.set(SWIMMING, while_SWIMMING);
  });

  receive(ON_FISHERMAN_FIGHT, () => {
    cancelChangeSwimDirections();
    setSwimDirection_TowardFisherman();
    changeSwimDirectionCallback = setSwimDirection_TowardFisherman;

    state.set(BEING_REELED, while_BEING_REELED);
  });

  receive(ON_FISH_CAUGHT, () => {
    cancelChangeSwimDirections();
    fish.setRotationFromEuler(new Euler(degToRad(-90), 0, 0));

    state.set(FLOPPING, while_FLOPPING);
  });

  receive(RESET, () => {
    cancelFlop();
    setRandomScale(2, 5);
    setFishPosition(new Vector3(0, 2, 50));
    fish.lookAt(getFishermanPosition());

    state.set(IDLE, null);
  });
}

function while_SWIMMING() {
  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  swimForward();
}

function while_BEING_REELED() {
  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  swimForward();
  checkDistance();
}

function while_FLOPPING() {
  if (flopTimeoutId === null) {
    flopRandomly();
  }

  animationMixer.update(delta * flopPlaybackSpeed);
}

/* Animations */

let animationMixer: AnimationMixer;

function setupAnimation(gltf: GLTF) {
  animationMixer = new AnimationMixer(fish);

  animationMixer.addEventListener('finished', () => {
    flopTimeoutId = null;
  });

  setupAnimation_Flop(gltf);
}

// Flop Animation //

let flopAnimationAction: AnimationAction;
let flopPlaybackSpeed = 2.5;
let flopTimeoutId: NodeJS.Timeout | null = null;

function setupAnimation_Flop(gltf: GLTF) {
  flopAnimationAction = animationMixer.clipAction(
    AnimationClip.findByName(gltf.animations, 'flop')
  );
}

function flopRandomly() {
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
  flopAnimationAction.reset();
  flopAnimationAction.play().repetitions = flopCount;
}

function cancelFlop() {
  clearTimeout(flopTimeoutId as NodeJS.Timeout);
  flopAnimationAction.stop();
  flopAnimationAction.reset();
}

function setFlopPlaybackSpeed(s: number) {
  if (s <= 0) s = 0.1;
  flopPlaybackSpeed = s;
}

/* Transformation */

export function getFishPosition() {
  return fish.position.clone();
}

function setFishPosition(p: Vector3) {
  fish.position.copy(p);
}

function moveBelowBobber() {
  const b = getBobberPosition();
  fish.position.set(b.x, fish.position.y, b.z);
}

function setRandomScale(min: number, max: number) {
  const scale = getRandomFloat(min, max);
  fish.scale.set(scale, scale, scale);
}

function checkDistance() {
  const catchDistance = 30;
  const distance = getFishPosition().distanceTo(getFishermanPosition());
  if (distance < catchDistance) {
    transmit(ON_FISH_CAUGHT);
  }
}

/* Swimming */

const swimSpeed = 30;
let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;
let changeSwimDirectionCallback: () => void = setSwimDirection_TowardFisherman;

function cancelChangeSwimDirections() {
  clearTimeout(swimDirectionChangeTimeoutId as NodeJS.Timeout);
  swimDirectionChangeTimeoutId = null;
}

function setSwimDirection_TowardFisherman() {
  const halfAngleOffset = degToRad(45 / 2);

  const angleOffset = getRandomFloat(-halfAngleOffset, halfAngleOffset);

  const direction = new Vector3().copy(
    getDirection(getFishPosition(), getFishermanPosition())
  );

  setDirectionFrom(direction, angleOffset);
}

function setSwimDirection_AwayFisherman() {
  const halfAngleOffset = degToRad(180 / 2);

  const angleOffset = getRandomFloat(-halfAngleOffset, halfAngleOffset);

  const direction = new Vector3().copy(
    getDirection(getFishermanPosition(), getFishPosition())
  );

  setDirectionFrom(direction, angleOffset);
}

function setDirectionFrom(vec: Vector3, angleOffset: number) {
  fish.setRotationFromAxisAngle(
    new Vector3(0, 1, 0),
    Math.atan2(vec.x, vec.z) + angleOffset // rads
  );
}

function changeSwimDirections() {
  if (swimDirectionChangeTimeoutId !== null) return;

  const delay = getRandomInt(300, 1000);

  swimDirectionChangeTimeoutId = setTimeout(() => {
    changeSwimDirectionCallback();

    swimDirectionChangeTimeoutId = null;
  }, delay);
}

function swimForward() {
  const v = new Vector3();
  fish.getWorldDirection(v);
  fish.position.addScaledVector(v, swimSpeed * delta);
}
