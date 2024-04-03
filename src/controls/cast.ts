import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { isREELING, playCastAnimation } from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';
import { setFishState_BEING_REELED } from '../scene/fish';

export const castPoint = new Vector3();

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    if (isAimingAtWater && !isREELING()) {
      castPoint.copy(aimPoint);
      playCastAnimation();
      return;
    }

    if (isREELING()) {
      setFishState_BEING_REELED();
    }
  });
}
