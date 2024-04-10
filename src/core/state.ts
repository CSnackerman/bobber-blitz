import { NullableVoidFunc, PriorityFunc, VoidFunc } from './types';

/**
 * The State class is intended be used to make a module stateful.
 * You can create an enum of state values and use them as \<T\> type in the constructor.
 *
 * Use {@link set()} to assign a callback function. Typically {@link set()} is called within a signal {@link observe()}.
 * Many of the modules in the scene directory call {@link update()} once per frame.
 *
 * The names of the states don't really serve any purpose aside from
 * debugging. There are no conditional checks on the names--forgone in place of callback swapping.
 */
export class State<T> {
  #state: T;
  #onUpdate: NullableVoidFunc;

  constructor(initialState: T, onUpdate: NullableVoidFunc) {
    this.#state = initialState;
    this.#onUpdate = onUpdate;
  }

  get = () => this.#state;
  set = (newState: T, newOnUpdate: NullableVoidFunc) => {
    this.#state = newState;
    this.#onUpdate = newOnUpdate;
    propagate(Signals.STATE_CHANGE);
  };
  update = () => this.#onUpdate?.();
}

/**
 * Signals typically {@link propagate} at the start of the transition from one state to the next;
 * however, there are also some standalone signals e.g. {@link RESET}.
 */
export enum Signals {
  RESET = 'RESET',
  STATE_CHANGE = 'STATE_CHANGE',
  ON_CAST = 'ON_CAST',
  ON_FISHING = 'ON_FISHING',
  ON_FISH_ON = 'ON_FISH_ON',
  ON_FISH_OFFENSE = 'ON_FISH_OFFENSE',
  ON_FISH_DEFENSE = 'ON_FISH_DEFENSE',
  ON_FISH_CATCH = 'ON_FISH_CATCH',
}

const SignalRegistry = new Map<Signals, PriorityFunc[]>();

export function propagate(s: Signals) {
  const prioFuncs = SignalRegistry.get(s);
  if (!prioFuncs) throw `Invalid emit(${s})`;
  prioFuncs.forEach((prioFunc) => {
    prioFunc[1]();
  });
}

export function observe(s: Signals, func: VoidFunc, prio: number = 0) {
  const prioFuncs = SignalRegistry.get(s) ?? [];

  prioFuncs.push([prio, func]);

  prioFuncs.sort((a, b) => a[0] - b[0]);

  SignalRegistry.set(s, prioFuncs);
}

// debug
export function printSignalRegistry(s: Signals) {
  SignalRegistry.get(s)?.forEach((v) => {
    console.log(`${v[0]} --> ${v[1]}`);
  });
}
