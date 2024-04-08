import { Clock } from 'three';

const clock = new Clock(true); // autostart

export let delta: number = 0.001;

export function updateTimeDelta() {
  delta = clock.getDelta();
}

export function getElapsedTime() {
  return clock.elapsedTime;
}
