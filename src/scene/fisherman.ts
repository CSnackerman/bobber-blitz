import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { aimPoint } from '../controls/aim';
import { isSpaceDown } from '../controls/reel';
import { State } from '../core/state';
import { delta } from '../core/time';
import {
  ON_CASTING,
  ON_FISHING,
  ON_FISH_CAUGHT,
  ON_FISH_FIGHT,
  ON_FISH_ON,
  RESET,
  receive,
  transmit,
} from '../events/event_manager';
import { getTopBobberPoint } from './bobber';
import { getFishPosition } from './fish';
import { setupFishingLine } from './fishing_line';
import sceneRoot from './scene';

let fisherman: Group;

let fishermanMixer: AnimationMixer;
let castAnimAction: AnimationAction;

enum FishermanState {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  FISHING = 'FISHING',
  FISH_ON = 'FISH_ON',
  REELING = 'REELING',
  HOLDING_PRIZE = 'HOLDING_PRIZE',
}

const { IDLE, CASTING, FISHING, FISH_ON, REELING, HOLDING_PRIZE } =
  FishermanState;

let state = new State<FishermanState>(IDLE, while_IDLE);

export const getFishermanState = () => state.get();

function while_IDLE() {
  fisherman.lookAt(aimPoint);
}

function while_CASTING() {
  fisherman.lookAt(getTopBobberPoint());
  fishermanMixer.update(delta * 3);
}

function while_FISHING() {
  fisherman.lookAt(getTopBobberPoint());

  if (isSpaceDown) transmit(RESET);
}

function while_FISH_ON() {
  if (isSpaceDown) transmit(ON_FISH_FIGHT);
}

function while_REELING() {
  fisherman.lookAt(getFishPosition());
}

function while_HOLDING_PRIZE() {
  return;
}

function setupReceivers() {
  receive(RESET, () => {
    state.set(IDLE, while_IDLE);
  });

  receive(ON_CASTING, () => {
    playCastAnimation();

    state.set(CASTING, while_CASTING);
  });

  receive(ON_FISHING, () => {
    state.set(FISHING, while_FISHING);
  });

  receive(ON_FISH_ON, () => {
    state.set(FISH_ON, while_FISH_ON);
  });

  receive(ON_FISH_FIGHT, () => {
    state.set(REELING, while_REELING);
  });

  receive(ON_FISH_CAUGHT, () => {
    state.set(HOLDING_PRIZE, while_HOLDING_PRIZE);
  });
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

  setupReceivers();
}

export function updateFisherman() {
  state.update();
}

/* Utility */

export function getFishingLineAnchorPoint() {
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
