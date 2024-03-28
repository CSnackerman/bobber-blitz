import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import sceneRoot from "./scene";
import { AnimationAction, AnimationClip, AnimationMixer, Group } from "three";
import { delta } from "../core/time";

let fish: Group;

let fishMixer: AnimationMixer;
let flopAction: AnimationAction;

export async function setupFishAsync() {
  const gltfLoader = new GLTFLoader();

  const gltf = await gltfLoader.loadAsync("/models/fish.glb");

  fish = gltf.scene;

  fish.scale.set(2, 2, 2);
  fish.position.x = 50;
  fish.visible = false;

  sceneRoot.add(fish);

  // setup animation
  fishMixer = new AnimationMixer(fish);
  const animations = gltf.animations;
  const clip = AnimationClip.findByName(animations, "flop");
  flopAction = fishMixer.clipAction(clip);
}

export function updateFish() {
  fishMixer.update(delta);
}

export function showFish() {
  fish.visible = true;
}

export function hideFish() {
  fish.visible = false;
}

function flopFish() {
  flopAction.reset();
  flopAction.play().repetitions = 10;
}

let plunkTimerId: NodeJS.Timeout;

export function setFlopInterval() {
  clearTimeout(plunkTimerId);
  const min = 5000;
  const max = 11000;
  plunkTimerId = setTimeout(
    () => flopFish(),
    Math.random() * (max - min) + min
  );
}
