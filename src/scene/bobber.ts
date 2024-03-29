import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { delta, getElapsedTime } from '../core/time';
import { castPoint } from '../controls/cast';
import { getRandomInt } from '../util/random';
import { setFishermanState_FISH_ON, setFishermanState_IDLE } from './fisherman';
import { camera } from './camera';

let bobber: Group;

let bobberMixer: AnimationMixer;
let plunkAnimAction: AnimationAction;

export async function setupBobberAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync('/models/bobber.glb');

  bobber = gltf.scene;

  bobber.scale.set(2, 2, 2);
  bobber.position.x = 50;
  bobber.visible = false;

  sceneRoot.add(bobber);

  // setup animation
  bobberMixer = new AnimationMixer(bobber);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, 'plunk');
  plunkAnimAction = bobberMixer.clipAction(clip);
}

export function getTopBobberPoint(): Vector3 {
  let p = new Vector3();
  bobber.getObjectByName('top_bobber')?.getWorldPosition(p);
  return p;
}

export function updateBobber() {
  bobberMixer.update(delta);
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

function plunkBobber() {
  setFishermanState_FISH_ON();
  plunkAnimAction.reset();
  plunkAnimAction.play().repetitions = 3;

  // on animation finished
  const onFinished = setFishermanState_IDLE;
  if (!bobberMixer.hasEventListener('finished', onFinished))
    bobberMixer.addEventListener('finished', onFinished);
}

let plunkTimerId: NodeJS.Timeout;

export function setPlunkTimer() {
  clearTimeout(plunkTimerId);
  const min = 5000;
  const max = 11000;
  plunkTimerId = setTimeout(plunkBobber, getRandomInt(min, max));
}

export function getBobberScreenCoords() {
  const worldPosition = new Vector3();
  bobber.getWorldPosition(worldPosition);

  worldPosition.project(camera);

  return new Vector3(
    ((worldPosition.x + 1) / 2) * window.innerWidth,
    ((-worldPosition.y + 1) / 2) * window.innerHeight,
    1
  );
}
