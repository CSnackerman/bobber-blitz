import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import { setupFishingLine, updateFishingLine } from './fishing_line';
import { degToRad } from 'three/src/math/MathUtils.js';
import { aimPoint, showReticle } from '../controls/aim';
import { delta } from '../core/time';
import {
  cancelBobberPlunk,
  getTopBobberPoint,
  hideBobber,
  plopBobber,
  setPlunkTimer,
  showBobber,
} from './bobber';
import { hideUI_fishOn, showUI_fishOn } from '../ui/ui_fish_on';
import { isSpaceDown } from '../controls/reel';

let fisherman: Group;

let fishermanMixer: AnimationMixer;
let castAnimAction: AnimationAction;

export type FishermanState =
  | 'IDLE'
  | 'CASTING'
  | 'FISHING'
  | 'FISH_ON'
  | 'REELING';

export let fishermanState: FishermanState = 'IDLE';
export function getFishermanState() {
  return fishermanState;
}
export function setFishermanState(state: FishermanState) {
  fishermanState = state;
}
export const isIDLE = () => fishermanState === 'IDLE';
export const isCASTING = () => fishermanState === 'CASTING';
export const isFISHING = () => fishermanState === 'FISHING';
export const isFISH_ON = () => fishermanState === 'FISH_ON';
export const isREELING = () => fishermanState === 'REELING';

export function setFishermanState_IDLE() {
  setFishermanState('IDLE');
  hideBobber();
  showReticle();
  hideUI_fishOn();
}

export function setFishermanState_CASTING() {
  setFishermanState('CASTING');
  hideBobber();
  plopBobber();
}

export function setFishermanState_FISHING() {
  setFishermanState('FISHING');
  showBobber();
  setPlunkTimer();
}

export function setFishermanState_FISH_ON() {
  setFishermanState('FISH_ON');
  showUI_fishOn();
}

export function setFishermanState_REELING() {
  setFishermanState('REELING');
  hideUI_fishOn();
  hideBobber();
  cancelBobberPlunk();
}

export async function setupFishermanAsync() {
  const loader = new GLTFLoader();

  const loaded = await loader.loadAsync('/models/fisherman.glb');

  fisherman = loaded.scene as Group;

  fisherman.scale.set(10, 10, 10);
  fisherman.rotation.y = degToRad(90);

  sceneRoot.add(fisherman);

  setupFishingLine();

  // setup animation
  fishermanMixer = new AnimationMixer(fisherman);
  const animations = loaded.animations;
  const castAnimClip = AnimationClip.findByName(animations, 'cast_anim');
  castAnimAction = fishermanMixer.clipAction(castAnimClip);
}

export function updateFisherman() {
  if (isIDLE()) {
    fisherman.lookAt(aimPoint);
  } else {
    fisherman.lookAt(getTopBobberPoint());
  }

  if (isFISH_ON() && isSpaceDown) {
    setFishermanState_REELING();
  }

  fishermanMixer.update(delta * 3);
  updateFishingLine();
}

// util

export function getFishingLineAnchorPoint(): Vector3 {
  let p = new Vector3();
  fisherman.getObjectByName('string_pivot')?.getWorldPosition(p);
  return p;
}

export function playCastAnimation() {
  // play animation if not in middle of casting
  if (!isCASTING()) {
    setFishermanState_CASTING();
    castAnimAction.reset();
  }

  castAnimAction.play().repetitions = 1;

  // on finished
  const onFinished = setFishermanState_FISHING;

  const hasOnFinished = fishermanMixer.hasEventListener('finished', onFinished);

  if (!hasOnFinished) {
    fishermanMixer.addEventListener('finished', onFinished);
  }
}

export function castAnimationIsPlaying() {
  return castAnimAction.isRunning();
}
