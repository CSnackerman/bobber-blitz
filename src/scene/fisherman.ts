import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import sceneRoot from './scene';
import { setupFishingLine, updateFishingLine } from './fishing_line';
import { degToRad } from 'three/src/math/MathUtils.js';
import { aimPoint } from '../controls/aim';
import { delta } from '../core/time';
import {
  getTopBobberPoint,
  hideBobber,
  plopBobber,
  plunkBobber,
  showBobber,
} from './bobber';

let fisherman: Group;

let fishermanMixer: AnimationMixer;
let castAnimAction: AnimationAction;

export let fishermanState: 'IDLE' | 'CASTING' | 'FISHING' = 'IDLE';

export async function setupFishermanAsync() {
  const loader = new GLTFLoader();

  const loaded = await loader.loadAsync('/models/fisherman.glb');

  fisherman = loaded.scene as Group;

  fisherman.scale.set(10, 10, 10);
  fisherman.rotation.y = degToRad(90);

  sceneRoot.add(fisherman);

  setupFishingLine();

  // setup animation
  fishermanMixer = new AnimationMixer(fisherman);
  fishermanMixer.addEventListener('finished', () => {
    fishermanState = 'FISHING';
    showBobber();
    setTimeout(() => {
      plunkBobber();
    }, 5000);
  });
  const animations = loaded.animations;
  const castAnimClip = AnimationClip.findByName(animations, 'cast_anim');
  castAnimAction = fishermanMixer.clipAction(castAnimClip);
}

export function updateFisherman() {
  if (fishermanState === 'IDLE') {
    fisherman.lookAt(aimPoint);
  } else {
    fisherman.lookAt(getTopBobberPoint());
  }

  fishermanMixer.update(delta * 3);
  updateFishingLine();
}

// util

export function getFishingLineAnchorPoint(): Vector3 {
  let p = new Vector3();
  fisherman.getObjectByName('string_pivot')?.getWorldPosition(p);
  return p;
}

export function playCastAnimation() {
  if (!castAnimAction.isRunning()) {
    hideBobber();
    plopBobber();
    castAnimAction.reset();
    fishermanState = 'CASTING';
  }
  fishermanState = 'CASTING';
  castAnimAction.play().repetitions = 1;
}

export function castAnimationIsPlaying() {
  return castAnimAction.isRunning();
}
