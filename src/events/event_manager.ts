const et = new EventTarget();

export const STATE_CHANGE = 'state_change';
export const FISH_HOOKED = 'hook_fish';
export const FISH_CAUGHT = 'caught_fish';
export const RESET = 'reset';

type EventName =
  | typeof STATE_CHANGE
  | typeof FISH_HOOKED
  | typeof FISH_CAUGHT
  | typeof RESET;

const Events = {
  [STATE_CHANGE]: new Event(STATE_CHANGE),
  [FISH_HOOKED]: new Event(FISH_HOOKED),
  [FISH_CAUGHT]: new Event(FISH_CAUGHT),
  [RESET]: new Event(RESET),
} as const;

export function transmit(e: EventName) {
  et.dispatchEvent(Events[e]);
}

export function receive(e: EventName, action: () => void) {
  et.addEventListener(e, action);
}
