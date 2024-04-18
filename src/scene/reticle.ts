import {
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  TorusGeometry,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { renderer } from '../core/renderer';
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
let enabled = false;

export const reticlePoint = new Vector3();

const raycaster = new Raycaster();
const reticle = new Mesh(
  new TorusGeometry(3, 0.3).rotateX(degToRad(90)),
  new MeshStandardMaterial({ color: 'cyan', transparent: true, opacity: 0.8 })
);

function setup() {
  raycaster.params.Points.threshold = 0.1;

  rootScene.add(reticle);

  setupReceivers();

  renderer.domElement.addEventListener('mouseenter', () => (enabled = true));
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
  if (!enabled) return;

  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObject(water, false);

  const intersection = intersections[0];

  if (!intersection?.point) return;

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
