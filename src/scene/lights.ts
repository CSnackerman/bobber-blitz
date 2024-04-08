import { AmbientLight, DirectionalLight } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { rootScene } from './scene';

export { setup as setupLights };

function setup() {
  {
    const light = new AmbientLight('white', 0.5);
    rootScene.add(light);
  }
  {
    const light = new DirectionalLight('white', 2);
    light.rotateX(degToRad(45));
    rootScene.add(light);
  }
}
