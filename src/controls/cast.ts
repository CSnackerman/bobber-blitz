import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { playCastAnimation } from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';
import { isMobile } from '../util/device';
import {
  ON_CASTING,
  ON_FISHERMAN_FIGHT,
  ON_FISHING,
  ON_FISH_FIGHT,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
} from '../events/event_manager';

export const castPoint = new Vector3();

type CastState = 'DISABLED' | 'CAN_CAST' | 'CAN_REEL';

let castState: CastState = 'CAN_CAST';

function is(s: CastState) {
  return castState === s;
}

function setState(s: CastState) {
  transmit(STATE_CHANGE);
  castState = s;
}

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    if (is('DISABLED')) return;

    if (isAimingAtWater && is('CAN_CAST')) {
      castPoint.copy(aimPoint);
      playCastAnimation();
      return;
    }

    if (isMobile() && is('CAN_REEL')) {
      transmit(ON_FISHERMAN_FIGHT);
      return;
    }

    if (is('CAN_REEL')) {
      transmit(ON_FISHERMAN_FIGHT);
      return;
    }
  });

  receive(RESET, () => {
    setState('CAN_CAST');
  });

  receive(ON_CASTING, () => {
    setState('DISABLED');
  });

  receive(ON_FISHING, () => {
    setState('CAN_CAST');
  });

  receive(ON_FISH_FIGHT, () => {
    setState('CAN_REEL');
  });
}
