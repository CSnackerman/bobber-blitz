import {
  ArrowHelper,
  AxesHelper,
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Sphere,
  SphereGeometry,
  Vector3,
} from 'three';
import { getRandomColorHex } from '../util/random';
import { rootScene } from '../scene/scene';

interface TrackingOrb {
  meshToTrack: Object3D;
  selfMesh: Mesh;
}

const trackingOrbs: TrackingOrb[] = [];

export function updateDebug() {
  updateTrackingOrbs();
}

export function createTrackingOrb(meshToTrack: Group) {
  if (!meshToTrack) return;

  // get bounding sphere
  const sphere = new Sphere();
  new Box3().setFromObject(meshToTrack).getBoundingSphere(sphere);

  const selfMesh = new Mesh(
    new SphereGeometry(sphere.radius),
    new MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.5 })
  );

  trackingOrbs.push({ meshToTrack, selfMesh });

  rootScene.add(selfMesh);

  return selfMesh;
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
  rootScene.add(helper);
  return helper;
}

export function showWorldAxes() {
  const axesHelper = new AxesHelper(10);
  axesHelper.position.setY(75);
  rootScene.add(axesHelper);
}
