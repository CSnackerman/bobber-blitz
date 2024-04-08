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
import { rootScene } from '../scene/scene';
import { water } from '../scene/water';

export { setup as setupAim };

export const aimPoint = new Vector3();
export let isAimingAtWater: boolean = false;
const raycaster = new Raycaster();
const reticle = new Mesh(
  new TorusGeometry(3, 0.3).rotateX(degToRad(90)),
  new MeshStandardMaterial({ color: 'red', transparent: true, opacity: 0.8 })
);

function setup() {
  raycaster.params.Points.threshold = 0.1;

  rootScene.add(reticle);

  receive(RESET, () => {
    showReticle();
  });
}

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
    reticle.translateY(0.5);
    aimPoint.copy(info.point);
    isAimingAtWater = true;
  } else {
    isAimingAtWater = false;
  }
}
