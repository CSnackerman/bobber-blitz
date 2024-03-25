import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { playCastAnimation } from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';

export const castPoint = new Vector3();

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    if (isAimingAtWater) {
      castPoint.copy(aimPoint);
      playCastAnimation();
    }
  });
}
