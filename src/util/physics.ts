import { Vector3 } from 'three';

export function getTrajectoryPoints(
  p1: Vector3,
  p2: Vector3,
  peakHeight: number,
  steps: number = 32
) {
  const points: Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    var x = (1 - t) * p1.x + t * p2.x;
    var y = (1 - t) * p1.y + t * p2.y + 4 * t * (1 - t) * peakHeight;
    var z = (1 - t) * p1.z + t * p2.z;

    points.push(new Vector3(x, y, z));
  }

  return points;
}
