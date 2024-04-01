import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector2,
  Vector3,
} from 'three';
import { delta } from '../core/time';
import { getRandomFloat, getRandomInt } from '../util/random';
import { getBobberPosition } from './bobber';
import { degToRad } from 'three/src/math/MathUtils.js';
import { eventManager, STATE_CHANGE_EVENT } from '../events/event_manager';

let fish: Group;

let fishMixer: AnimationMixer;
let flopAction: AnimationAction;
let flopPlaybackSpeed = 2.5;

const swimSpeed = 30;

export type FishState = 'FLOPPING' | 'SWIMMING' | 'IDLE';
let fishState: FishState = 'IDLE';

export const isFLOPPING = () => fishState === 'FLOPPING';
export const isSWIMMING = () => fishState === 'SWIMMING';
export const isIDLE = () => fishState === 'IDLE';

export const getFishState = () => fishState;

export function setFishState(s: FishState) {
  fishState = s;
  eventManager.dispatchEvent(STATE_CHANGE_EVENT);
}

export function setFishState_FLOPPING() {
  setFishState('FLOPPING');
}
export function setFishState_SWIMMING() {
  setFishState('SWIMMING');
}
export function setFishState_IDLE() {
  setFishState('IDLE');
}

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  setRandomScale(2, 5);
  // fish.visible = false;
  setFishPosition(new Vector3(5, 2, 50));
  fish.lookAt(new Vector3(0, 2, 0));
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

  flopRandomly();
}

export function updateFish() {
  if (!fish.visible) return;

  if (isIDLE()) {
    flopRandomly();
  }

  if (swimDirectionChangeTimeoutId === null) {
    changeSwimDirections();
  }

  swimForward();

  fishMixer.update(delta * flopPlaybackSpeed);
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

function setDirectionRandomlyAwayFromFisherman(arc: number) {
  const fisherman2d = new Vector2(0, 0);
  const fish2d = new Vector2(fish.position.x, fish.position.z);
  const angleBetween = fisherman2d.angleTo(fish2d);

  const arcRadians = degToRad(arc);
  const adjusted =
    angleBetween + getRandomFloat(-arcRadians / 2, arcRadians / 2);

  console.log('ang', angleBetween);
  console.log('adj', adjusted);

  fish.rotation.set(fish.rotation.x, adjusted, fish.rotation.z);
}

let swimDirectionChangeTimeoutId: NodeJS.Timeout | null = null;

function changeSwimDirections() {
  if (swimDirectionChangeTimeoutId !== null) return;

  const delay = getRandomInt(300, 3500);

  swimDirectionChangeTimeoutId = setTimeout(() => {
    setRandomSwimDirection();
    // setDirectionRandomlyAwayFromFisherman(30);
    swimDirectionChangeTimeoutId = null;
  }, delay);
}

function setRandomSwimDirection() {
  fish.rotateY(degToRad(getRandomFloat(-180, 180)));
}

export function getFishPosition() {
  return fish.position;
}
