import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { State } from '../core/state';
import {
  ON_CASTING,
  ON_FISHERMAN_FIGHT,
  ON_FISHING,
  ON_FISH_FIGHT,
  ON_FISH_ON,
  RESET,
  receive,
  transmit,
} from '../events/event_manager';
import { aimPoint, isAimingAtWater } from './aim';

export const castPoint = new Vector3();

export enum CastState {
  DISABLED = 'DISABLED',
  CAN_CAST = 'CAN_CAST',
  CAN_REEL = 'CAN_REEL',
}
const { DISABLED, CAN_CAST, CAN_REEL } = CastState;

const state = new State<CastState>(CAN_CAST, null);

export const getCastState = () => state.get();

function setupReceivers() {
  receive(RESET, () => {
    state.set(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_CASTING, () => {
    state.set(DISABLED, null);
  });

  receive(ON_FISHING, () => {
    state.set(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_FISH_ON, () => {
    state.set(CAN_CAST, () => {
      cast();
    });
  });

  receive(ON_FISH_FIGHT, () => {
    state.set(CAN_REEL, () => {
      transmit(ON_FISHERMAN_FIGHT);
    });
  });
}

export function setupCastHandler() {
  renderer.domElement.addEventListener('click', () => {
    state.update();
  });

  setupReceivers();
}

function cast() {
  if (!isAimingAtWater) return;
  castPoint.copy(aimPoint);
  transmit(ON_CASTING);
}
