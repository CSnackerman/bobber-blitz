import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import {
  isFISH_ON,
  isREELING,
  playCastAnimation,
  setFishermanState_REELING,
} from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';
import { setFishState_BEING_REELED } from '../scene/fish';
import { isMobile } from '../util/device';

export const castPoint = new Vector3();

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    if (isAimingAtWater && !isREELING() && !isFISH_ON()) {
      castPoint.copy(aimPoint);
      playCastAnimation();
      return;
    }

    if (isMobile() && isFISH_ON()) {
      setFishermanState_REELING();
      return;
    }

    if (isREELING()) {
      setFishState_BEING_REELED();
      return;
    }
  });
}
