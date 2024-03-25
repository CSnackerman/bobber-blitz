import { PlaneGeometry, RepeatWrapping, TextureLoader, Vector3 } from 'three';
import { Water } from 'three/addons/objects/Water.js';
import sceneRoot from './scene';

export const water = new Water(new PlaneGeometry(3000, 3000), {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new TextureLoader().load(
    'assets/textures/waternormals.jpg',
    (texture) => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
    }
  ),
  sunDirection: new Vector3(),
  sunColor: 0x00007f,
  waterColor: 0x001e0f,
  distortionScale: 3,
  fog: undefined,
});

export function setupWater() {
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -1, 0);

  sceneRoot.add(water);
}

export function updateWater() {
  water.material.uniforms['time'].value += 1.0 / 700.0;
}
