import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { castPoint } from '../controls/cast';
import { CAST_CLOCK, delta, getClock, getElapsedTime } from '../core/clock';
import { Signals, State, emit, receive } from '../core/state';
import { camera } from './camera';
import {
  CAST_TIME,
  interpolatedPoints,
  launchTrajectoryPoints,
} from './fishing_line';
import { rootScene } from './scene';

export {
  getPosition as getBobberPosition,
  getScreenCoords as getBobberScreenCoords,
  getState as getBobberState,
  getTopPoint as getBobberTopPoint,
  setup as setupBobberAsync,
  update as updateBobber,
};

/* Initialization */

let bobber: Group;
const castClock = getClock(CAST_CLOCK);

async function setup() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/bobber.glb');

  bobber = gltf.scene;

  rootScene.add(bobber);

  setupAnimation(gltf);

  setupReceivers();
}

enum BobberStates {
  HIDDEN = 'HIDDEN',
  LAUNCHING = 'LAUNCHING',
  BOBBING = 'BOBBING',
  PLUNKING = 'PLUNKING',
}
const { HIDDEN, LAUNCHING, BOBBING, PLUNKING } = BobberStates;

const { RESET, CAST, LAUNCH_BOBBER, BOBBER_LANDED, BEGIN_FISHING, HOOK, BITE } =
  Signals;

const state = new State<BobberStates>(HIDDEN, null);

const getState = state.get;
const update = state.invoke;

function setupReceivers() {
  receive(RESET, () => {
    bobber.scale.set(2, 2, 2);
    bobber.position.x = 50;
    hide();
    cancelPlunk();

    state.set(HIDDEN, null);
  });

  receive(
    CAST,
    () => {
      cancelPlunk();
      hide();
      moveToCastPoint();

      state.set(HIDDEN, null);
    },
    2 // prio
  );

  receive(
    LAUNCH_BOBBER,
    () => {
      show();
      state.set(LAUNCHING, while_LAUNCHING());
    },
    2 // prio
  );

  receive(BOBBER_LANDED, () => {
    state.set(BOBBING, while_BOBBING);
  });

  receive(BEGIN_FISHING, () => {
    setPlunkTimer();
  });

  receive(BITE, () => {
    state.set(PLUNKING, while_PLUNKING);
  });

  receive(HOOK, () => {
    hide();
    cancelPlunk();

    state.set(HIDDEN, null);
  });
}

/// /// ///

function while_LAUNCHING() {
  const nPoints = launchTrajectoryPoints.length;
  const timestep = Math.floor(CAST_TIME / nPoints);

  return () => {
    const elapsed = castClock.getElapsedTime() * 1000;
    const currentTimestep = Math.floor(elapsed / timestep);

    if (currentTimestep > nPoints - 1) return;

    bobber.position.copy(interpolatedPoints[currentTimestep]);
  };
}

function while_BOBBING() {
  bobber.position.y = Math.sin(getElapsedTime() * 3.0) * 0.4;
}

function while_PLUNKING() {
  animationMixer.update(delta);
}

/* Animation */

let animationMixer: AnimationMixer;
let plunkAnimationAction: AnimationAction;
let plunkTimerId: NodeJS.Timeout;

function setupAnimation(gltf: GLTF) {
  animationMixer = new AnimationMixer(bobber);
  animationMixer.addEventListener('finished', () => emit(RESET));

  setupAnimation_Plunk(gltf);
}

function setupAnimation_Plunk(gltf: GLTF) {
  plunkAnimationAction = animationMixer.clipAction(
    AnimationClip.findByName(gltf.animations, 'plunk')
  );
}

function plunk() {
  emit(BITE);
  plunkAnimationAction.reset();
  plunkAnimationAction.play().repetitions = 3;
}

function setPlunkTimer() {
  clearTimeout(plunkTimerId);
  plunkTimerId = setTimeout(plunk, 500); // temp
}

function cancelPlunk() {
  clearTimeout(plunkTimerId);
  plunkAnimationAction.stop();
  plunkAnimationAction.reset();
}

/* Transformation */

function getTopPoint() {
  let p = new Vector3();
  bobber.getObjectByName('top_bobber')?.getWorldPosition(p);
  return p;
}

function getPosition() {
  return bobber.position;
}

function moveToCastPoint() {
  bobber.position.copy(castPoint);
}

function getScreenCoords() {
  const worldPosition = new Vector3();
  bobber.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}

function show() {
  bobber.visible = true;
}

function hide() {
  bobber.visible = false;
}
