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

export { castPoint, getState as getCastState, setup as setupCast };

const castPoint = new Vector3();

enum CastStates {
  DISABLED = 'DISABLED',
  CAN_CAST = 'CAN_CAST',
  CAN_REEL = 'CAN_REEL',
}
const { DISABLED, CAN_CAST, CAN_REEL } = CastStates;

const state = new State<CastStates>(CAN_CAST, null);

const getState = () => state.get();

function setup() {
  renderer.domElement.addEventListener('click', () => {
    state.update();
  });

  setupReceivers();
}

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

function cast() {
  if (!isAimingAtWater) return;
  castPoint.copy(aimPoint);
  transmit(ON_CASTING);
}
