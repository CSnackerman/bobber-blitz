import {
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  TorusGeometry,
  Vector3,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { RESET, receive } from '../events/event_manager';
import { pointer } from '../events/pointer';
import { camera } from '../scene/camera';
import sceneRoot from '../scene/scene';
import { water } from '../scene/water';

export const aimPoint = new Vector3();
export let isAimingAtWater: boolean;

const raycaster = new Raycaster();
raycaster.params.Points.threshold = 0.1;

const reticle = new Mesh(
  new TorusGeometry(3, 0.3).rotateX(degToRad(90)),
  new MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.8 })
);

sceneRoot.add(reticle);

receive(RESET, () => {
  showReticle();
});

export function showReticle() {
  reticle.visible = true;
}

export function hideReticle() {
  reticle.visible = false;
}

export function postitionReticle() {
  raycaster.setFromCamera(pointer, camera);
  const intersection = raycaster.intersectObject(water, false);

  if (intersection.length) {
    const info = intersection[0];
    reticle.position.copy(info.point);
    aimPoint.copy(info.point);
    isAimingAtWater = true;
  } else {
    isAimingAtWater = false;
  }
}
