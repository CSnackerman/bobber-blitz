import {
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  TorusGeometry,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Signals, State, receive } from '../core/state';
import { pointer } from '../events/pointer';
import { camera } from './camera';
import { rootScene } from './scene';
import { water } from './water';

export {
  getReticlePosition,
  getState as getReticleState,
  setup as setupReticle,
  update as updateReticle,
};

/* Initialization */

export const reticlePoint = new Vector3();

const raycaster = new Raycaster();
const reticle = new Mesh(
  new TorusGeometry(3, 0.3).rotateX(degToRad(90)),
  new MeshStandardMaterial({
    color: 'purple',
    transparent: true,
    opacity: 0.9,
  })
);

function setup() {
  raycaster.params.Points.threshold = 0.1;

  rootScene.add(reticle);

  setupReceivers();
}

/* State */

enum ReticleStates {
  HIDDEN = 'HIDDEN',
  TRACKING = 'TRACKING',
  FROZEN = 'FROZEN',
}
const { HIDDEN, TRACKING, FROZEN } = ReticleStates;

const { RESET, CAST, BOBBER_LANDED, BEGIN_FISHING } = Signals;

const state = new State<ReticleStates>(TRACKING, while_TRACKING);

const getState = state.get;
const update = state.invoke;

function setupReceivers() {
  receive(RESET, () => {
    show();
    state.set(TRACKING, while_TRACKING);
  });

  receive(
    CAST,
    () => {
      moveToPointer();
      show();
      state.set(FROZEN, null);
    },
    0 // prio
  );

  receive(BOBBER_LANDED, () => {
    hide();
  });

  receive(BEGIN_FISHING, () => {
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

  const intersection = intersections[0];

  if (!intersection?.point) return;
  if (intersection.point.y > 3) return; // hack

  reticle.position.copy(intersection.point);
  reticle.translateY(0.5);
  reticlePoint.copy(intersection.point);
}

function getReticlePosition() {
  return reticle.position.clone();
}

function show() {
  reticle.visible = true;
}

function hide() {
  reticle.visible = false;
}
