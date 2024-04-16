import { Object3D, Vector2, Vector3 } from 'three';

export { lookAtHorizontal, getDirection, str, copyVectorArray };

const yAxis = new Vector3(0, 1, 0);

function lookAtHorizontal(looker: Object3D, at: Vector3) {
  const at2d = new Vector2(at.z, at.x);

  looker.setRotationFromAxisAngle(yAxis, at2d.angle());
}

function getDirection(from: Vector3, to: Vector3) {
  const f = from.clone();
  const t = to.clone();
  const diff = t.sub(f);

  return diff.normalize();
}

function str(v: Vector3) {
  const f = (n: number) => {
    const negative = n < 0 ? '-' : '+';
    return negative + Math.abs(n).toFixed(2).padStart(6, '0');
  };
  return `(${f(v.x)}, ${f(v.y)}, ${f(v.z)})`;
}

function copyVectorArray(arr: Vector3[]) {
  const out = new Array<Vector3>(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[i].clone();
  }

  return out;
}
