import { Clock } from 'three';
import { Signals, receive } from './state';

// core clock

const clock = new Clock(true); // autostart

export let delta: number = 0.001;

export function updateTimeDelta() {
  delta = clock.getDelta();
}

export function getElapsedTime() {
  return clock.elapsedTime;
}

// named/shared clocks
const clocks = new Map<ClockName, Clock>();

export const CAST_CLOCK = 'cast_clock';
type ClockName = typeof CAST_CLOCK;

export function getClock(name: ClockName) {
  let clock = clocks.get(name);

  if (!clock) {
    clock = new Clock();
    clocks.set(name, clock);
  }

  return clock;
}

// receivers
receive(
  Signals.LAUNCH_BOBBER,
  () => {
    getClock(CAST_CLOCK).start();
  },
  10 // prio
);

// Mock clock
export class MockClock {
  #elapsedTime: number = 0; // mock ms
  #tickStep: number = 16; // mock ms

  tick() {
    this.#elapsedTime += this.#tickStep;
  }

  reset() {
    this.#elapsedTime = 0;
  }

  getElapsed() {
    return this.#elapsedTime;
  }
}
