import {
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  TorusGeometry,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Signals, State, observe } from '../core/state';
import { pointer } from '../events/pointer';
import { camera } from './camera';
import { rootScene } from './scene';
import { water } from './water';

export {
  getState as getReticleState,
  setup as setupReticle,
  update as updateReticle,
};

// debug
export function getReticlePosition() {
  return reticle.position.clone();
}

/* Initialization */

export const reticlePoint = new Vector3();
export let isAimingAtWater: boolean = false;

const raycaster = new Raycaster();
const reticle = new Mesh(
  new TorusGeometry(3, 0.3).rotateX(degToRad(90)),
  new MeshStandardMaterial({ color: 'cyan', transparent: true, opacity: 0.8 })
);

function setup() {
  raycaster.params.Points.threshold = 0.1;

  rootScene.add(reticle);

  setupObservers();
}

/* State */

enum ReticleStates {
  HIDDEN = 'HIDDEN',
  TRACKING = 'TRACKING',
  FROZEN = 'FROZEN',
}
const { HIDDEN, TRACKING, FROZEN } = ReticleStates;

const state = new State<ReticleStates>(TRACKING, while_TRACKING);

const getState = () => state.get();

function update() {
  state.update();
}

const { RESET, ON_CAST, ON_FISHING } = Signals;

function setupObservers() {
  observe(RESET, () => {
    show();

    state.set(TRACKING, while_TRACKING);
  });

  observe(
    ON_CAST,
    () => {
      moveToPointer();
      show();
      state.set(FROZEN, null);
    },
    0 // prio
  );

  observe(ON_FISHING, () => {
    hide();
    state.set(HIDDEN, null);
  });
}

function while_TRACKING() {
  moveToPointer();
}

/* Transformation */

function moveToPointer() {
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObject(water, false);

  if (intersections.length) {
    const intersection = intersections[0];
    reticle.position.copy(intersection.point);
    reticle.translateY(0.5);
    reticlePoint.copy(intersection.point);
    isAimingAtWater = true;
  } else {
    isAimingAtWater = false;
  }
}

function show() {
  reticle.visible = true;
}

function hide() {
  reticle.visible = false;
}
