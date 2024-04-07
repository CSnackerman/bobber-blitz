const et = new EventTarget();

/* Event Registry */

export const RESET = 'reset';
export const STATE_CHANGE = 'state_change';
export const ON_CASTING = 'on_casting';
export const ON_FISHING = 'on_fishing';
export const ON_FISH_ON = 'on_fish_on';
export const ON_FISH_FIGHT = 'on_fish_fight';
export const ON_FISHERMAN_FIGHT = 'on_fisherman_fight';
export const ON_FISH_CAUGHT = 'on_fish_caught';

type EventName =
  | typeof RESET
  | typeof STATE_CHANGE
  | typeof ON_CASTING
  | typeof ON_FISHING
  | typeof ON_FISH_ON
  | typeof ON_FISH_FIGHT
  | typeof ON_FISHERMAN_FIGHT
  | typeof ON_FISH_CAUGHT;

export function transmit(e: EventName) {
  if (e !== STATE_CHANGE) console.log(e);
  et.dispatchEvent(new Event(e));
}

export function receive(e: EventName, action: () => void) {
  et.addEventListener(e, action);
}
