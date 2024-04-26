import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, degToRad } from 'three/src/math/MathUtils.js';
import { delta } from '../core/clock';
import { Signals, State, emit, receive } from '../core/state';
import { setLineTension } from '../ui/ui_line_tension';
import { lookAtHorizontal } from '../util/vector';
import { getBobberTopPoint } from './bobber';
import { camera } from './camera';
import { getFishPosition } from './fish';
import { getReticlePosition } from './reticle';
import { rootScene } from './scene';

export {
  getPosition as getFishermanPosition,
  getScreenCoords as getFishermanScreenCoords,
  getState as getFishermanState,
  getFishingLineAnchorPoint,
  setup as setupFishermanAsync,
  update as updateFisherman,
};

/* Initialization */

let fisherman: Object3D;

let leanToggle = true;
let leanAmount = 0;
const MaxLean = 33;
const LeanBackRate = 33;
const LeanForwardRate = 133;

async function setup() {
  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync('/models/fisherman.glb');

  fisherman = gltf.scene;

  fisherman.scale.set(10, 10, 10);

  rootScene.add(fisherman);

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

const {
  RESET,
  CAST,
  LAUNCH_BOBBER,
  BEGIN_FISHING,
  BITE,
  HOOK,
  REEL_IN,
  REEL_OUT,
  CATCH_FISH,
} = Signals;

let state = new State<FishermanStates>(IDLE, while_IDLE);

const getState = state.get;
const update = state.invoke;

function setupReceivers() {
  receive(RESET, () => {
    leanAmount = 0;
    state.set(IDLE, while_IDLE);
  });

  receive(
    CAST,
    () => {
      fisherman.lookAt(getBobberTopPoint());
      playCastAnimation();
      state.set(CASTING, while_CASTING);
    },
    3 // prio
  );

  receive(BEGIN_FISHING, () => {
    state.set(FISHING, while_FISHING);
  });

  receive(BITE, () => {
    state.set(FISH_ON, null);
  });

  receive(HOOK, () => {
    state.set(REELING, while_REELING);
  });

  receive(REEL_IN, () => {
    leanToggle = true;
  });
  receive(REEL_OUT, () => {
    leanToggle = false;
  });

  receive(CATCH_FISH, () => {
    lookAtHorizontal(fisherman, getFishPosition());
    state.set(HOLDING_PRIZE, while_HOLDING_PRIZE);
  });
}

function while_IDLE() {
  lookAtHorizontal(fisherman, getReticlePosition());
}

function while_CASTING() {
  animationMixer.update(delta * 3);
}

function while_FISHING() {
  fisherman.lookAt(getBobberTopPoint());
}

function while_REELING() {
  lookAtHorizontal(fisherman, getFishPosition());

  if (leanToggle) {
    leanAmount += LeanBackRate * delta;
  } else {
    leanAmount -= LeanForwardRate * delta;
  }

  leanAmount = clamp(leanAmount, 0, MaxLean);

  lean(leanAmount);

  setLineTension(leanAmount / MaxLean);
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
    emit(LAUNCH_BOBBER);
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

function getScreenCoords() {
  const worldPosition = new Vector3();
  fisherman.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}

function lean(deg: number) {
  const rad = degToRad(deg);
  const xAxis = new Vector3(1, 0, 0);
  fisherman.rotateOnAxis(xAxis, -rad);
}
