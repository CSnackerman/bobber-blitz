import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { State, Signals, propagate, observe } from '../core/state';
import { reticlePoint, isAimingAtWater } from '../scene/reticle';

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

  setupObservers();
}

const {
  RESET,
  ON_CAST,
  ON_FISHING,
  ON_FISH_ON,
  ON_FISH_OFFENSE,
  ON_FISH_DEFENSE,
} = Signals;

function setupObservers() {
  observe(RESET, () => {
    state.set(CAN_CAST, () => {
      cast();
      propagate(ON_CAST);
    });
  });

  observe(
    ON_CAST,
    () => {
      state.set(DISABLED, null);
      cast();
    },
    1 // prio
  );

  observe(ON_FISHING, () => {
    state.set(CAN_CAST, () => {
      cast();
      propagate(ON_CAST);
    });
  });

  observe(ON_FISH_ON, () => {
    state.set(CAN_CAST, () => {
      cast();
      propagate(ON_CAST);
    });
  });

  observe(ON_FISH_OFFENSE, () => {
    state.set(CAN_REEL, () => {
      propagate(ON_FISH_DEFENSE);
    });
  });
}

function cast() {
  if (!isAimingAtWater) return;
  castPoint.copy(reticlePoint);
}
