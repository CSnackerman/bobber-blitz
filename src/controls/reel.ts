import { Signals, emit, receive } from '../core/state';

export { setup as setupReel };

let enabled = false;
let isHooked = false;

function setup() {
  addEventListener('pointerdown', onPointerDown);
  addEventListener('pointerup', onPointerUp);

  setupReceivers();
}

function setupReceivers() {
  receive(Signals.RESET, () => {
    enabled = false;
    isHooked = false;
  });
  receive(Signals.BITE, () => {
    enabled = true;
  });
  receive(Signals.CATCH_FISH, () => (enabled = false));
}

function onPointerDown() {
  if (!enabled) return;

  if (!isHooked) {
    emit(Signals.HOOK);
    isHooked = true;
  }

  emit(Signals.REEL_IN);
}

function onPointerUp() {
  if (!enabled) return;

  emit(Signals.REEL_OUT);
}
