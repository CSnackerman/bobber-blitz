import {
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import sceneRoot from './scene';
import { fishermanState } from './fisherman';

interface TrackingOrb {
  meshToTrack: Object3D;
  selfMesh: Mesh;
}

const trackingOrbs: TrackingOrb[] = [];
let prevFishermanState: string = '';

export function updateDebug() {
  updateTrackingOrbs();

  if (fishermanState != prevFishermanState) {
    console.log('fishermanState:', fishermanState);
  }
  prevFishermanState = fishermanState;
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
