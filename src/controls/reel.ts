import { Signals, State, emit, receive } from '../core/state';

export { setup as setupReel, getState as getReelState };

export let isSpaceDown = false;

enum ReelStates {
  DISABLED = 'DISABLED',
  ENABLED = 'ENABLED',
  REELING_IN = 'REELING_IN',
  REELING_OUT = 'REELING_OUT',
}
const { DISABLED, ENABLED, REELING_IN, REELING_OUT } = ReelStates;

const { RESET, BITE, REEL_OUT, REEL_IN } = Signals;

const state = new State<ReelStates>(DISABLED, null);

const getState = state.get;
const onClick = state.invoke;

function setup() {
  addEventListener('click', onClick);

  setupReceivers();
}

function setupReceivers() {
  receive(RESET, () => state.set(DISABLED, null));
  receive(BITE, () => state.set(ENABLED, onClick_ENABLED));
  receive(REEL_OUT, () => state.set(REELING_OUT, onClick_REELING_OUT));
  receive(REEL_IN, () => state.set(REELING_IN, null));
}

function onClick_ENABLED() {
  emit(REEL_OUT);
}

function onClick_REELING_OUT() {
  emit(REEL_IN);
}
