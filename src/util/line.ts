import { Vector3 } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';

export { interpolate as interpolateLine };

function interpolate(
  points1: Vector3[],
  points2: Vector3[],
  out: Vector3[],
  alpha: number,
  stopAt?: number
) {
  if (points1.length !== points2.length || points1.length < 1) {
    throw 'Cannot interpolate. Different array lengths.';
  }

  const len = stopAt ?? points1.length;

  if (stopAt && stopAt > points1.length) {
    throw 'Invalid stopAt value.';
  }

  for (let i = 0; i < len; i++) {
    interpolateVertex(points1, points2, out, i, alpha);
  }
}

function interpolateVertex(
  arr1: Vector3[],
  arr2: Vector3[],
  out: Vector3[],
  index: number,
  alpha: number
) {
  alpha = clamp(alpha, 0, 1);

  out[index] = arr1[index].clone().lerp(arr2[index], alpha);
}
