import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Euler,
  Group,
  Vector3,
} from 'three';
import { delta } from '../core/time';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getBobberPosition } from './bobber';
import { degToRad } from 'three/src/math/MathUtils.js';
import { getFishermanPosition } from './fisherman';
import { getDirection, getDistance } from '../util/vector';
import {
  ON_FISHERMAN_FIGHT,
  ON_FISH_CAUGHT,
  ON_FISH_FIGHT,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
} from '../events/event_manager';

let fish: Group;

let fishMixer: AnimationMixer;
let flopAction: AnimationAction;
let flopPlaybackSpeed = 2.5;

const swimSpeed = 30;

type FishState = 'SWIMMING' | 'BEING_REELED' | 'FLOPPING' | 'IDLE';

let fishState: FishState = 'IDLE';

export const getFishState = () => fishState;

function setFishState(s: FishState) {
  fishState = s;
  transmit(STATE_CHANGE);
}

function is(s: FishState) {
  return fishState === s;
}

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  sceneRoot.add(fish);

  // setup animation
  fishMixer = new AnimationMixer(fish);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, 'flop');
  flopAction = fishMixer.clipAction(clip);

  fishMixer.addEventListener('finished', () => {
    flopTimeoutId = null;
  });

  // event handlers
  receive(ON_FISH_FIGHT, () => {
    setFishState('SWIMMING');
    setDirectionRandomlyAway(0);
  });

  receive(ON_FISHERMAN_FIGHT, () => {
    setFishState('BEING_REELED');
    setDirectionRandomlyToward(0);
  });

  receive(ON_FISH_CAUGHT, () => {
    setFishState('FLOPPING');
    cancelChangeSwimDirections();
    fish.setRotationFromEuler(new Euler(degToRad(-90), 0, 0));
  });

  receive(RESET, () => {
    setFishState('IDLE');
    cancelFlop();
    setRandomScale(2, 5);
    setFishPosition(new Vector3(0, 2, 50));
    fish.lookAt(getFishermanPosition());
  });
}

export function updateFish() {
  fishMixer.update(delta * flopPlaybackSpeed);

  if (is('IDLE')) {
    return;
  }

  if (is('FLOPPING')) {
    if (flopTimeoutId === null) {
      flopRandomly();
    }

    return;
  }

  if (is('SWIMMING') || is('BEING_REELED')) {
    if (swimDirectionChangeTimeoutId === null) {
      changeSwimDirections();
    }

    swimForward();
    checkDistance();
    return;
  }
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
  setFishState('FLOPPING');
  flopAction.reset();
  flopAction.play().repetitions = flopCount;
}

function cancelFlop() {
  clearTimeout(flopTimeoutId as NodeJS.Timeout);
  flopAction.stop();
  flopAction.reset();
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

function checkDistance() {
  const catchDistance = 30;
  const distance = getDistance(getFishermanPosition(), getFishPosition());
  if (distance < catchDistance) {
    transmit(ON_FISH_CAUGHT);
  }
}

let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;

function cancelChangeSwimDirections() {
  clearTimeout(swimDirectionChangeTimeoutId as NodeJS.Timeout);
  swimDirectionChangeTimeoutId = null;
}

function changeSwimDirections() {
  if (swimDirectionChangeTimeoutId !== null) return;

  const delay = getRandomInt(300, 1000);

  swimDirectionChangeTimeoutId = setTimeout(() => {
    if (is('BEING_REELED')) {
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
}

export function getFishPosition() {
  return fish.position.clone();
}

export function showFish() {
  fish.visible = true;
}

export function hideFish() {
  fish.visible = false;
}
