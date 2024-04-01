import { Vector2, Vector3 } from 'three';

export function getTheta_XZ(a: Vector3, b: Vector3) {
  const u = new Vector2(a.x, a.z);
  const v = new Vector2(b.x, b.z);

  return Math.atan2(u.y, u.x) - Math.atan2(v.y, v.x);
}

export function getDistance(p1: Vector3, p2: Vector3) {
  // length of p2 - p1
  return p2.clone().sub(p1.clone()).length();
}
