import { Object3D, Object3DEventMap } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getElapsedTime } from '../core/time';
import sceneRoot from './scene';

let boat: Object3D<Object3DEventMap>;

export async function setupBoatAsync() {
  const loader = new GLTFLoader();

  const gltfLoaded = await loader.loadAsync('/models/boat.glb');

  boat = gltfLoaded.scene;

  boat.scale.set(25, 25, 25);
  boat.position.set(0, -2, 0);

  sceneRoot.add(boat);
}

export function updateBoat() {
  boat.rotation.z = Math.sin(getElapsedTime() * 3.0) * 0.03; // side-to-side
  boat.rotation.x = Math.sin(getElapsedTime() * 0.5) * 0.01; // forward-back
}
