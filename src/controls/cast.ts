import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { State, Signals, emit, receive } from '../core/state';
import { reticlePoint } from '../scene/reticle';

export { castPoint, getState as getCastState, setup as setupCast };

const castPoint = new Vector3();

enum CastStates {
  DISABLED = 'DISABLED',
  CAN_CAST = 'CAN_CAST',
  CAN_REEL = 'CAN_REEL',
}
const { DISABLED, CAN_CAST, CAN_REEL } = CastStates;

const { RESET, CAST, ON_FISHING, ON_FISH_OFFENSE, ON_FISH_DEFENSE } = Signals;

const state = new State<CastStates>(CAN_CAST, null);

const getState = state.get;
const onClick = state.invoke;

function setup() {
  renderer.domElement.addEventListener('click', onClick);

  setupReceivers();
}

function setupReceivers() {
  receive(RESET, () => {
    state.set(CAN_CAST, () => emit(CAST));
  });

  receive(
    CAST,
    () => {
      state.set(DISABLED, null);
      castPoint.copy(reticlePoint);
    },
    1
  );

  receive(ON_FISHING, () => {
    state.set(CAN_CAST, () => emit(CAST));
  });

  receive(ON_FISH_OFFENSE, () => {
    state.set(CAN_REEL, () => emit(ON_FISH_DEFENSE));
  });

  receive(ON_FISH_DEFENSE, () => {
    state.set(DISABLED, null);
  });
}
