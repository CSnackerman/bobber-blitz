import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import { Group, Vector3 } from 'three';
import { getElapsedTime } from '../core/time';
import { castPoint } from '../controls/cast';

let bobber: Group;

export async function setupBobberAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/bobber.glb');

  bobber = gltf.scene;

  bobber.scale.set(2, 2, 2);
  bobber.position.x = 50;
  bobber.visible = false;

  sceneRoot.add(bobber);
}

export function getTopBobberPoint(): Vector3 {
  let p = new Vector3();
  bobber.getObjectByName('top_bobber')?.getWorldPosition(p);
  return p;
}

export function updateBobber() {
  bobber.position.y = Math.sin(getElapsedTime() * 3.0) * 0.4; // side-to-side
}

export function plopBobber() {
  bobber.position.copy(castPoint);
}

export function showBobber() {
  bobber.visible = true;
}

export function hideBobber() {
  bobber.visible = false;
}
