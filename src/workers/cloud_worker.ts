import { Vector3 } from 'three';
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';
import { CloudTextureSize } from '../scene/clouds';
import { getRandomFloat } from '../util/random';

/*************************************************/

onmessage = () => {
  postMessage(createCloudTextureData());
};

/*************************************************/

function createCloudTextureData() {
  const size = CloudTextureSize;
  const data = new Uint8Array(Math.pow(size, 3));

  let i = 0;
  const scale = getRandomFloat(0.04, 0.07);
  const perlin = new ImprovedNoise();
  const vector = new Vector3();

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const L = vector
          .set(x, y, z)
          .subScalar(size / 2)
          .divideScalar(size)
          .length();
        const noise = perlin.noise(
          (x * scale) / 1.5,
          y * scale,
          (z * scale) / 1.5
        );
        const d = 1.0 - L;
        data[i] = (128 + 128 * noise) * d * d;

        i++;
      }
    }
  }

  return data;
}
