import { Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getElapsedTime } from '../core/clock';
import { rootScene } from './scene';

export { setup as setupBoatAsync, update as updateBoat };

let boat: Group;

async function setup() {
  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync('/models/boat.glb');

  boat = gltf.scene;

  boat.scale.set(25, 25, 25);
  boat.position.set(0, -2, 0);

  rootScene.add(boat);
}

function update() {
  boat.rotation.z = Math.sin(getElapsedTime() * 3.0) * 0.03; // side-to-side
  boat.rotation.x = Math.sin(getElapsedTime() * 0.5) * 0.01; // forward-back
}
