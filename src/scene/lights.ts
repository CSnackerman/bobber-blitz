import { AmbientLight, DirectionalLight } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import sceneRoot from './scene';

export function setupLights() {
  {
    const light = new AmbientLight('white', 0.5);
    sceneRoot.add(light);
  }
  {
    const light = new DirectionalLight('white', 2);
    light.rotateX(degToRad(45));
    sceneRoot.add(light);
  }
}
