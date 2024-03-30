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

let fish: Group;

let fishMixer: AnimationMixer;
let flopAction: AnimationAction;
let flopPlaybackSpeed = 2.5;

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/fish.glb');

  fish = gltf.scene;

  setRandomScale();
  fish.visible = false;

  sceneRoot.add(fish);

  // setup animation
  fishMixer = new AnimationMixer(fish);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, 'flop');
  flopAction = fishMixer.clipAction(clip);

  flopRandomly();
}

export function updateFish() {
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

let flopTimeoutId: NodeJS.Timeout;
export function flopRandomly() {
  const minSessions = 3;
  const maxSessions = 10;
  let nFlopSessions = getRandomInt(minSessions, maxSessions);

  function getNextFlopTime(): number {
    const minDelay = 200;
    const maxDelay = 2000;
    return getRandomInt(minDelay, maxDelay);
  }

  function flopRecursively() {
    setFlopPlaybackSpeed(getRandomFloat(0.5, 3));
    flopFish(getRandomInt(1, 7));

    if (nFlopSessions < 1) {
      clearTimeout(flopTimeoutId);
      return;
    }
    nFlopSessions--;

    flopTimeoutId = setTimeout(() => {
      flopFish(getRandomInt(1, 7));
      flopRecursively();
    }, getNextFlopTime());
  }

  flopRecursively();
}

function flopFish(flopCount: number) {
  flopAction.reset();
  flopAction.play().repetitions = flopCount;
}

export function setFishPosition(p: Vector3) {
  fish.position.copy(p);
}

function setRandomScale() {
  const scale = getRandomFloat(0.75, 2.2);
  fish.scale.set(scale, scale, scale);
}
