import { Vector3 } from 'three';

export function getTrajectoryPoints(
  p1: Vector3,
  p2: Vector3,
  peakHeight: number,
  steps = 32
) {
  const points: Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * p1.x + t * p2.x;
    const y = (1 - t) * p1.y + t * p2.y + 4 * t * (1 - t) * peakHeight;
    const z = (1 - t) * p1.z + t * p2.z;

    points.push(new Vector3(x, y, z));
  }

  return points;
}

export function getDanglingTrajectoryPoints(
  p1: Vector3,
  p2: Vector3,
  steps = 32
) {
  const points: Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * p1.x + t * p2.x;
    let y = (1 - t) * p1.y + t * p2.y + 10 * t * (1 - t) * -11;
    const z = (1 - t) * p1.z + t * p2.z;

    y < 0 ? (y = 0) : null;

    points.push(new Vector3(x, y, z));
  }

  return points;
}
