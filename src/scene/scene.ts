import { Scene } from 'three';

export { rootScene, init as initScene };

let rootScene: Scene;

function init() {
  rootScene = new Scene();
}
