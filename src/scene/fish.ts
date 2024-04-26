import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Euler,
  Object3D,
  Sphere,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, degToRad } from 'three/src/math/MathUtils.js';
import { MockClock, delta } from '../core/clock';
import { Signals, State, emit, receive } from '../core/state';
import { setStamina } from '../ui/ui_fish_stamina';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getDirection } from '../util/vector';
import { getBobberPosition } from './bobber';
import { camera } from './camera';
import { getFishermanPosition } from './fisherman';
import { rootScene } from './scene';

export {
  getCategory as getFishCategory,
  getDistanceFromFisherman as getFishDistanceFromFisherman,
  getFishMouthPosition,
  getPosition as getFishPosition,
  getScreenCoords as getFishScreenCoords,
  getState as getFishState,
  setup as setupFishAsync,
  update as updateFish,
};

/* Initialization */
let fish: Object3D;

const mockClock = new MockClock(); //! temp-debug
let size = 0;
const CatchDistance = 25;
const LostDistance = 1500;
const MaxStamina = 100;
const StaminaDecay = -5;

let stamina = MaxStamina;

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
  REELING_OUT = 'REELING_OUT',
  REELING_IN = 'REELING_IN',
  FLOPPING = 'FLOPPING',
}
const { IDLE, REELING_OUT, REELING_IN, FLOPPING } = FishStates;

const { RESET, HOOK, REEL_OUT, REEL_IN, CATCH_FISH } = Signals;

let state = new State<FishStates>(IDLE, null);

const update = state.invoke;
const getState = state.get;

function setupReceivers() {
  receive(RESET, () => {
    cancelFlop();
    setScale(getRandomFloat(0.2, 11));
    setPosition(0, -size, size + CatchDistance);
    fish.lookAt(getFishermanPosition());
    stamina = MaxStamina;

    state.set(IDLE, null);
  });

  receive(HOOK, () => {
    cancelChangeSwimDirections();
    moveBelowBobber();
    setSwimDirection_AwayFisherman();
    changeSwimDirectionCallback = setSwimDirection_AwayFisherman;

    state.set(REELING_OUT, while_REELING_OUT);
  });

  receive(REEL_OUT, () => {
    cancelChangeSwimDirections();
    setSwimDirection_AwayFisherman();
    changeSwimDirectionCallback = setSwimDirection_AwayFisherman;

    state.set(REELING_OUT, while_REELING_OUT);
  });

  receive(REEL_IN, () => {
    mockClock.reset(); //! temp-debug

    state.set(REELING_IN, while_REELING_IN);
  });

  receive(CATCH_FISH, () => {
    cancelChangeSwimDirections();
    fish.position.setY(25);
    fish.setRotationFromEuler(new Euler(degToRad(-90), 0, 0));

    state.set(FLOPPING, while_FLOPPING);
  });
}

function while_REELING_OUT() {
  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  checkDistance();

  swimForward();
}

function while_REELING_IN() {
  mockClock.tick();
  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  const towardFisherman = getDirection(getPosition(), getFishermanPosition());
  move(towardFisherman, 100);

  swimForward();
  checkDistance();
  // adjustStamina(StaminaDecay * (mockClock.getDeltaTime() / 1000));   //! temp-debug
  adjustStamina(StaminaDecay * delta);
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
}

function moveBelowBobber() {
  const b = getBobberPosition();
  fish.position.set(b.x, fish.position.y, b.z);
}

function getDistanceFromFisherman() {
  return getPosition().distanceTo(getFishermanPosition());
}

function checkDistance() {
  const distance = getDistanceFromFisherman();
  if (distance <= size + CatchDistance) {
    emit(CATCH_FISH);
  }
  if (distance >= LostDistance) {
    emit(RESET);
  }
}

function getFishMouthPosition() {
  let p = new Vector3();
  fish.getObjectByName('fish_mouth')?.getWorldPosition(p);
  return p;
}

function getScreenCoords() {
  const worldPosition = new Vector3();
  fish.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}

/* Swimming */

const SwimSpeed = 110;
let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;
let changeSwimDirectionCallback = () => {};

function cancelChangeSwimDirections() {
  clearTimeout(swimDirectionChangeTimeoutId as NodeJS.Timeout);
  swimDirectionChangeTimeoutId = null;
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
  const speed = SwimSpeed * getStaminaDecimal() * delta;
  const direction = new Vector3();
  fish.getWorldDirection(direction);
  fish.position.addScaledVector(direction, speed);
}

function move(toward: Vector3, speed: number) {
  toward.y = 0;
  fish.position.addScaledVector(toward, speed * delta);
}

/* Gameplay */
function syncStaminaUi() {
  setStamina((stamina / MaxStamina) * 100);
}

function adjustStamina(percent: number) {
  stamina += MaxStamina * (percent / 100.0);
  stamina = clamp(stamina, 0, MaxStamina);
  syncStaminaUi();
}

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

function getStaminaDecimal() {
  return stamina / MaxStamina;
}
