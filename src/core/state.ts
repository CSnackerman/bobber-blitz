import { isDev } from '../util/environment';
import { NullableVoidFunc, PriorityFunc, VoidFunc } from './types';

/**
 * The State class is intended be used to make a module stateful.
 * You can create an enum of state values and use them as \<T\> type in the constructor.
 *
 * Use {@link set()} to assign a callback function. Typically {@link set()} is called within a signal {@link receive()}.
 * Many of the modules in the scene directory call {@link invoke()} once per frame.
 *
 * The names of the states don't really serve any purpose aside from
 * debugging. There are no conditional checks on the names--forgone in place of callback swapping.
 */
export class State<T> {
  #name: T;
  #incantation: NullableVoidFunc;

  constructor(initialState: T, onUpdate: NullableVoidFunc) {
    this.#name = initialState;
    this.#incantation = onUpdate;
  }

  get = () => this.#name;
  set = (newState: T, newOnUpdate: NullableVoidFunc) => {
    this.#name = newState;
    this.#incantation = newOnUpdate;
    emit(Signals.STATE_CHANGE);
  };
  invoke = () => this.#incantation?.();
}

/**
 * Signals typically {@link emit} at the start of the transition from one state to the next;
 * however, there are also some standalone signals e.g. {@link RESET}.
 */
export enum Signals {
  STATE_CHANGE = 'STATE_CHANGE',
  RESET = 'RESET',
  CAST = 'CAST',
  LAUNCH_BOBBER = 'LAUNCH_BOBBER',
  BOBBER_LANDED = 'BOBBER_LANDED',
  BEGIN_FISHING = 'BEGIN_FISHING',
  BITE = 'BITE',
  HOOK = 'HOOK',
  REEL_OUT = 'REEL_OUT',
  REEL_IN = 'REEL_IN',
  CATCH_FISH = 'CATCH_FISH',
  SWEET_SPOT = 'SWEET_SPOT',
}

const SignalRegistry = new Map<Signals, PriorityFunc[]>();

export function emit(s: Signals) {
  if (isDev() && s !== Signals.STATE_CHANGE) console.log(s); //debug

  const prioFuncs = SignalRegistry.get(s) ?? [];
  prioFuncs.forEach((prioFunc) => {
    prioFunc[1]();
  });
}

export function receive(s: Signals, func: VoidFunc, prio: number = 0) {
  const prioFuncs = SignalRegistry.get(s) ?? [];

  prioFuncs.push([prio, func]);

  prioFuncs.sort((a, b) => a[0] - b[0]);

  SignalRegistry.set(s, prioFuncs);
}

// debug
export function printSignalRegistry(s: Signals) {
  if (!isDev()) return;

  SignalRegistry.get(s)?.forEach((v) => {
    console.log(`${v[0]} --> ${v[1]}`);
  });
}
