import {
  ArrowHelper,
  AxesHelper,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { getRandomColorHex } from '../util/random';
import sceneRoot from './scene';

interface TrackingOrb {
  meshToTrack: Object3D;
  selfMesh: Mesh;
}

const trackingOrbs: TrackingOrb[] = [];

export function updateDebug() {
  updateTrackingOrbs();
}

export function createTrackingOrb(meshToTrack: undefined | Object3D) {
  if (!meshToTrack) return;

  const selfMesh = new Mesh(
    new IcosahedronGeometry(1),
    new MeshStandardMaterial({ color: 'red' })
  );

  trackingOrbs.push({ meshToTrack, selfMesh });

  sceneRoot.add(selfMesh);
}

function updateTrackingOrbs() {
  trackingOrbs.forEach((orb: TrackingOrb) => {
    const wp = new Vector3();
    orb.meshToTrack.getWorldPosition(wp);
    orb.selfMesh.position.copy(wp);
  });
}

export function createArrowHelper(from: Vector3, to: Vector3) {
  const fromClone = from.clone();
  const toClone = to.clone();
  const diff = toClone.sub(fromClone);
  const direction = diff.normalize();

  const helper = new ArrowHelper(direction, from, 25, getRandomColorHex());
  sceneRoot.add(helper);
  return helper;
}

export function showWorldAxes() {
  const axesHelper = new AxesHelper(10);
  axesHelper.position.setY(75);
  sceneRoot.add(axesHelper);
}
