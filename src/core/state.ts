import { STATE_CHANGE, transmit } from '../events/event_manager';
import { NullableVoidCallback } from './types';

export class State<T> {
  #state: T;
  #onUpdate: NullableVoidCallback;

  constructor(initialState: T, onUpdate: NullableVoidCallback) {
    this.#state = initialState;
    this.#onUpdate = onUpdate;
  }

  get = () => this.#state;
  set = (newState: T, newOnUpdate: NullableVoidCallback) => {
    this.#state = newState;
    this.#onUpdate = newOnUpdate;
    transmit(STATE_CHANGE);
  };
  update = () => this.#onUpdate?.();
}
