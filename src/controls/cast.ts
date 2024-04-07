import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import {
  isFISH_ON,
  isREELING,
  playCastAnimation,
  setFishermanState_REELING,
} from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';
import { isMobile } from '../util/device';
import { ON_FISHERMAN_FIGHT, transmit } from '../events/event_manager';

export const castPoint = new Vector3();

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    if (isAimingAtWater && !isREELING()) {
      castPoint.copy(aimPoint);
      playCastAnimation();
      return;
    }

    if (isMobile() && isFISH_ON()) {
      setFishermanState_REELING();
      return;
    }

    if (isREELING()) {
      transmit(ON_FISHERMAN_FIGHT);
      return;
    }
  });
}
