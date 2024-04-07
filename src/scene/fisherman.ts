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
import { getTopBobberPoint } from './bobber';
import { isSpaceDown } from '../controls/reel';
import { getFishPosition } from './fish';
import {
  ON_CASTING,
  ON_FISH_CAUGHT,
  ON_FISH_FIGHT,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
  ON_FISHING,
  ON_FISH_ON,
} from '../events/event_manager';
import { NullableVoidCallback } from '../core/types';

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

let fishermanState: FishermanState = 'IDLE';

let update: NullableVoidCallback;

export function updateFisherman() {
  update?.();
}

export const getFishermanState = () => fishermanState;

function setState(s: FishermanState, onUpdate: NullableVoidCallback) {
  fishermanState = s;
  update = onUpdate;
  transmit(STATE_CHANGE);
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

  fishermanMixer.addEventListener('finished', () => {
    transmit(ON_FISHING);
  });

  // receivers
  receive(RESET, () => {
    setState('IDLE', () => {
      fisherman.lookAt(aimPoint);
    });
  });

  receive(ON_CASTING, () => {
    setState('CASTING', () => {
      fisherman.lookAt(getTopBobberPoint());
      fishermanMixer.update(delta * 3);
    });

    playCastAnimation();
  });

  receive(ON_FISHING, () => {
    setState('FISHING', () => {
      fisherman.lookAt(getTopBobberPoint());

      if (isSpaceDown) transmit(RESET);
    });
  });

  receive(ON_FISH_ON, () => {
    setState('FISH_ON', () => {
      if (isSpaceDown) transmit(ON_FISH_FIGHT);
    });
  });

  receive(ON_FISH_FIGHT, () => {
    setState('REELING', () => {
      fisherman.lookAt(getFishPosition());
    });
  });

  receive(ON_FISH_CAUGHT, () => {
    setState('HOLDING_PRIZE', () => {});
  });
}

// util

export function getFishingLineAnchorPoint(): Vector3 {
  let p = new Vector3();
  fisherman.getObjectByName('string_pivot')?.getWorldPosition(p);
  return p;
}

export function playCastAnimation() {
  castAnimAction.reset();

  castAnimAction.play().repetitions = 1;
}

export function castAnimationIsPlaying() {
  return castAnimAction.isRunning();
}

export function getFishermanPosition() {
  return fisherman.position.clone();
}
