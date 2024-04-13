import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Euler,
  Group,
  Sphere,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Signals, State, emit, receive } from '../core/state';
import { delta } from '../core/clock';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getDirection } from '../util/vector';
import { getBobberPosition } from './bobber';
import { getFishermanPosition } from './fisherman';
import { rootScene } from './scene';

export {
  getPosition as getFishPosition,
  getState as getFishState,
  getCategory as getFishCategory,
  setup as setupFishAsync,
  update as updateFish,
  getFishMouthPosition,
};

/* Initialization */
let fish: Group;
let size = 1;
const catchDistance = 25;
const lostDistance = 1100;

async function setup() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  rootScene.add(fish);

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

const { REEL_OUT, REEL_IN, CATCH_FISH, RESET } = Signals;

let state = new State<FishStates>(IDLE, null);

const update = state.invoke;
const getState = state.get;

function setupReceivers() {
  receive(RESET, () => {
    cancelFlop();
    setScale(getRandomFloat(0.2, 11));
    setPosition(0, -size, size + catchDistance);
    fish.lookAt(getFishermanPosition());

    state.set(IDLE, null);
  });

  receive(REEL_OUT, () => {
    cancelChangeSwimDirections();
    moveBelowBobber();
    setSwimDirection_AwayFisherman();
    changeSwimDirectionCallback = setSwimDirection_AwayFisherman;

    state.set(SWIMMING, while_SWIMMING);
  });

  receive(REEL_IN, () => {
    cancelChangeSwimDirections();
    setSwimDirection_TowardFisherman();
    changeSwimDirectionCallback = setSwimDirection_TowardFisherman;

    state.set(BEING_REELED, while_BEING_REELED);
  });

  receive(CATCH_FISH, () => {
    cancelChangeSwimDirections();
    fish.position.setY(25);
    fish.setRotationFromEuler(new Euler(degToRad(-90), 0, 0));

    state.set(FLOPPING, while_FLOPPING);
  });
}

function while_SWIMMING() {
  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  checkDistance();

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
    flop(nFlops);
  }, delay);
}

function flop(flopCount: number) {
  flopAnimationAction.reset();
  flopAnimationAction.play().repetitions = flopCount;
}

function cancelFlop() {
  clearTimeout(flopTimeoutId as NodeJS.Timeout);
  flopTimeoutId = null;
  flopAnimationAction.stop();
  flopAnimationAction.reset();
}

function setFlopPlaybackSpeed(s: number) {
  if (s <= 0) s = 0.1;
  flopPlaybackSpeed = s;
}

/* Transformation */

function getPosition() {
  return fish.position.clone();
}

function setPosition(x: number, y: number, z: number) {
  fish.position.set(x, y, z);
}

function setScale(s: number) {
  fish.scale.setScalar(s);
  recalculateSize();
}

function recalculateSize() {
  const sphere = new Sphere();
  new Box3().setFromObject(fish).getBoundingSphere(sphere);

  size = sphere.radius * 2;
  console.log('size', size);
}

function moveBelowBobber() {
  const b = getBobberPosition();
  fish.position.set(b.x, fish.position.y, b.z);
}

function checkDistance() {
  const distance = getPosition().distanceTo(getFishermanPosition());
  if (distance <= size + catchDistance) {
    emit(CATCH_FISH);
  }
  if (distance >= lostDistance) {
    emit(RESET);
  }
}

function getFishMouthPosition() {
  let p = new Vector3();
  fish.getObjectByName('fish_mouth')?.getWorldPosition(p);
  return p;
}

/* Swimming */

const swimSpeed = 100;
let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;
let changeSwimDirectionCallback = () => {};

function cancelChangeSwimDirections() {
  clearTimeout(swimDirectionChangeTimeoutId as NodeJS.Timeout);
  swimDirectionChangeTimeoutId = null;
}

function setSwimDirection_TowardFisherman() {
  const halfAngleOffset = degToRad(45 / 2);

  const angleOffset = getRandomFloat(-halfAngleOffset, halfAngleOffset);

  const direction = new Vector3().copy(
    getDirection(getPosition(), getFishermanPosition())
  );

  setDirectionFrom(direction, angleOffset);
}

function setSwimDirection_AwayFisherman() {
  const halfAngleOffset = degToRad(180 / 2);

  const angleOffset = getRandomFloat(-halfAngleOffset, halfAngleOffset);

  const direction = new Vector3().copy(
    getDirection(getFishermanPosition(), getPosition())
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

/* Misc. */

function getCategory() {
  if (size > 70) return 'Whale';
  if (size > 50) return 'Lunker';
  if (size > 40) return 'Jumbo Shrimp';
  if (size > 30) return 'Walleye';
  if (size > 25) return 'Largemouth Bass';
  if (size > 20) return 'Trout';
  if (size > 15) return 'Smallmouth Bass';
  if (size > 10) return 'Sunfish';
  if (size > 5) return 'Minnow';

  return 'Shrimp';
}
