import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import { setupFishingLine } from './fishing_line';
import { aimPoint } from '../controls/aim';
import { delta } from '../core/time';
import { cancelBobberPlunk, getTopBobberPoint, hideBobber } from './bobber';
import { hideUI_fishOn, showUI_fishOn } from '../ui/ui_fish_on';
import { isSpaceDown } from '../controls/reel';
import { showUI_fishHealth } from '../ui/ui_fish_health';
import { showUI_lineTension } from '../ui/ui_line_tension';
import { getFishPosition, moveFishBelowBobber } from './fish';
import {
  ON_CASTING,
  ON_FISH_CAUGHT,
  ON_FISH_FIGHT,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
  ON_FISHERMAN_IDLE,
  ON_FISHING,
  ON_FISH_ON,
} from '../events/event_manager';

let fisherman: Group;

let fishermanMixer: AnimationMixer;
let castAnimAction: AnimationAction;

export type FishermanState =
  | 'IDLE'
  | 'CASTING'
  | 'FISHING'
  | 'FISH_ON'
  | 'REELING'
  | 'HOLDING_PRIZE';

export let fishermanState: FishermanState = 'IDLE';

export function getFishermanState() {
  return fishermanState;
}
export function setFishermanState(state: FishermanState) {
  fishermanState = state;
  transmit(STATE_CHANGE);
}
export const isIDLE = () => fishermanState === 'IDLE';
export const isCASTING = () => fishermanState === 'CASTING';
export const isFISHING = () => fishermanState === 'FISHING';
export const isFISH_ON = () => fishermanState === 'FISH_ON';
export const isREELING = () => fishermanState === 'REELING';
export const isHOLDING_PRIZE = () => fishermanState === 'HOLDING_PRIZE';

export function setFishermanState_IDLE() {
  setFishermanState('IDLE');
  transmit(ON_FISHERMAN_IDLE);
}

export function setFishermanState_CASTING() {
  setFishermanState('CASTING');
  transmit(ON_CASTING);
}

export function setFishermanState_FISHING() {
  setFishermanState('FISHING');
  transmit(ON_FISHING);
}

export function setFishermanState_FISH_ON() {
  setFishermanState('FISH_ON');
  transmit(ON_FISH_ON);
}

export function setFishermanState_REELING() {
  setFishermanState('REELING');
  moveFishBelowBobber();
  hideUI_fishOn();
  hideBobber();
  cancelBobberPlunk();
  showUI_fishHealth();
  showUI_lineTension();
}

export function setFishermanState_HOLDING_PRIZE() {
  setFishermanState('HOLDING_PRIZE');
}

export async function setupFishermanAsync() {
  const loader = new GLTFLoader();

  const loaded = await loader.loadAsync('/models/fisherman.glb');

  fisherman = loaded.scene as Group;

  fisherman.scale.set(10, 10, 10);

  sceneRoot.add(fisherman);

  setupFishingLine();

  // setup animation
  fishermanMixer = new AnimationMixer(fisherman);
  const animations = loaded.animations;
  const castAnimClip = AnimationClip.findByName(animations, 'cast_anim');
  castAnimAction = fishermanMixer.clipAction(castAnimClip);
  fishermanMixer.addEventListener('finished', setFishermanState_FISHING);

  // receivers
  receive(RESET, setFishermanState_IDLE);
  receive(ON_FISH_FIGHT, setFishermanState_REELING);
  receive(ON_FISH_CAUGHT, setFishermanState_HOLDING_PRIZE);
}

export function updateFisherman() {
  fishermanMixer.update(delta * 3);

  if (isIDLE()) {
    fisherman.lookAt(aimPoint);
    return;
  }

  if (!(isFISH_ON() || isREELING()) && isSpaceDown) {
    setFishermanState_IDLE();
    return;
  }

  if (isCASTING() || isFISHING()) {
    fisherman.lookAt(getTopBobberPoint());
    return;
  }

  if (isFISH_ON() && isSpaceDown) {
    transmit(ON_FISH_FIGHT);
    return;
  }

  if (isREELING()) {
    fisherman.lookAt(getFishPosition());
    return;
  }
}

// util

export function getFishingLineAnchorPoint(): Vector3 {
  let p = new Vector3();
  fisherman.getObjectByName('string_pivot')?.getWorldPosition(p);
  return p;
}

export function playCastAnimation() {
  if (isIDLE() || isFISHING() || isFISH_ON()) {
    setFishermanState_CASTING();
    castAnimAction.reset();
  }

  castAnimAction.play().repetitions = 1;
}

export function castAnimationIsPlaying() {
  return castAnimAction.isRunning();
}

export function getFishermanPosition() {
  return fisherman.position.clone();
}
