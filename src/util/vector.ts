import { Vector2, Vector3 } from 'three';

export function getTheta_XZ(a: Vector3, b: Vector3) {
  const u = new Vector2(a.x, a.z);
  const v = new Vector2(b.x, b.z);

  return Math.atan2(u.y, u.x) - Math.atan2(v.y, v.x);
}

export function getDirection(from: Vector3, to: Vector3) {
  const f = from.clone();
  const t = to.clone();
  const diff = t.sub(f);

  return diff.normalize();
}

export function str(v: Vector3) {
  const f = (n: number) => {
    const negative = n < 0 ? '-' : '+';
    return negative + Math.abs(n).toFixed(2).padStart(6, '0');
  };
  return `(${f(v.x)}, ${f(v.y)}, ${f(v.z)})`;
}
