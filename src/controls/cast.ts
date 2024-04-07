import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { playCastAnimation } from '../scene/fisherman';
import { aimPoint, isAimingAtWater } from './aim';
import {
  ON_CASTING,
  ON_FISHERMAN_FIGHT,
  ON_FISHING,
  ON_FISH_FIGHT,
  ON_FISH_ON,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
} from '../events/event_manager';
import { NullableVoidCallback } from '../core/types';

export const castPoint = new Vector3();

export enum CastState {
  DISABLED = 'DISABLED',
  CAN_CAST = 'CAN_CAST',
  CAN_REEL = 'CAN_REEL',
}
const { DISABLED, CAN_CAST, CAN_REEL } = CastState;

let castState = CAN_CAST;

function setState(s: CastState, onUpdate: NullableVoidCallback) {
  castState = s;
  update = onUpdate;
  transmit(STATE_CHANGE);
}

export const getCastState = () => castState;

let update: NullableVoidCallback = null;

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    update?.();
  });

  receive(RESET, () => {
    setState(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_CASTING, () => {
    setState(DISABLED, null);
  });

  receive(ON_FISHING, () => {
    setState(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_FISH_ON, () => {
    setState(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_FISH_FIGHT, () => {
    setState(CAN_REEL, () => {
      transmit(ON_FISHERMAN_FIGHT);
    });
  });
}

function cast() {
  if (!isAimingAtWater) return;
  castPoint.copy(aimPoint);
  playCastAnimation();
  transmit(ON_CASTING);
}
