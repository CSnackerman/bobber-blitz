const et = new EventTarget();

// event names
export const STATE_CHANGE = 'state_change';
export const HOOK_FISH = 'hook_fish';

// events
const EVENT_STATE_CHANGE = new Event(STATE_CHANGE);
const EVENT_HOOK_FISH = new Event(HOOK_FISH);

// dispatchers
export const dispatch_HOOK_FISH = () => et.dispatchEvent(EVENT_HOOK_FISH);

export const dispatch_STATE_CHANGE = () => et.dispatchEvent(EVENT_STATE_CHANGE);

// listeners
export const addListener_HOOK_FISH = (callback: () => void) =>
  et.addEventListener(HOOK_FISH, callback);

export const addListener_STATE_CHANGE = (callback: () => void) =>
  et.addEventListener(STATE_CHANGE, callback);