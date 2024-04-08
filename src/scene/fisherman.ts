import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
import sceneRoot from './scene';

export {
  getPosition as getFishermanPosition,
  getState as getFishermanState,
  getFishingLineAnchorPoint,
  setup as setupFishermanAsync,
  update as updateFisherman,
};

/* Initialization */

let fisherman: Group;

async function setup() {
  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync('/models/fisherman.glb');

  fisherman = gltf.scene;

  fisherman.scale.set(10, 10, 10);

  sceneRoot.add(fisherman);

  setupAnimation(gltf);

  setupReceivers();
}

/* State */

enum FishermanStates {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  FISHING = 'FISHING',
  FISH_ON = 'FISH_ON',
  REELING = 'REELING',
  HOLDING_PRIZE = 'HOLDING_PRIZE',
}

const { IDLE, CASTING, FISHING, FISH_ON, REELING, HOLDING_PRIZE } =
  FishermanStates;

let state = new State<FishermanStates>(IDLE, while_IDLE);

const getState = () => state.get();

function update() {
  state.update();
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

function while_IDLE() {
  fisherman.lookAt(aimPoint);
}

function while_CASTING() {
  fisherman.lookAt(getTopBobberPoint());
  animationMixer.update(delta * 3);
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

/* Animation */

let animationMixer: AnimationMixer;
let castAnimationAction: AnimationAction;

function setupAnimation(gltf: GLTF) {
  animationMixer = new AnimationMixer(fisherman);

  animationMixer.addEventListener('finished', () => {
    transmit(ON_FISHING);
  });

  setupAnimation_Cast(gltf);
}

function setupAnimation_Cast(gltf: GLTF) {
  castAnimationAction = animationMixer.clipAction(
    AnimationClip.findByName(gltf.animations, 'cast_anim')
  );
}

function playCastAnimation() {
  castAnimationAction.reset();

  castAnimationAction.play().repetitions = 1;
}

/* Transformation */

function getPosition() {
  return fisherman.position.clone();
}

function getFishingLineAnchorPoint() {
  let p = new Vector3();
  fisherman.getObjectByName('string_pivot')?.getWorldPosition(p);
  return p;
}
