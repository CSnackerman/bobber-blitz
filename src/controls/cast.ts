import { Vector3 } from 'three';
import { renderer } from '../core/renderer';
import { State, Signals, emit, receive } from '../core/state';
import { reticlePoint } from '../scene/reticle';

export { castPoint, getState as getCastState, setup as setupCast };

const castPoint = new Vector3();

enum CastStates {
  DISABLED = 'DISABLED',
  ENABLED = 'ENABLED',
}
const { DISABLED, ENABLED } = CastStates;

const { RESET, CAST, BEGIN_FISHING } = Signals;

const state = new State<CastStates>(ENABLED, null);

const getState = state.get;
const onClick = state.invoke;

function setup() {
  renderer.domElement.addEventListener('click', onClick);

  setupReceivers();
}

function setupReceivers() {
  receive(RESET, () => {
    state.set(ENABLED, () => emit(CAST));
  });

  receive(
    CAST,
    () => {
      state.set(DISABLED, null);
      castPoint.copy(reticlePoint);
    },
    1
  );

  receive(BEGIN_FISHING, () => {
    state.set(ENABLED, () => emit(CAST));
  });
}
