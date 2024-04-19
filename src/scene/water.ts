import { PlaneGeometry, RepeatWrapping, TextureLoader, Vector3 } from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { rootScene } from './scene';

export const water = new Water(new PlaneGeometry(10000, 10000), {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new TextureLoader().load('/waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
  }),
  alpha: 0.75,
  sunDirection: new Vector3(),
  sunColor: 0x00007f,
  waterColor: 0x001e0f,
  distortionScale: 3,
  fog: undefined,
});

export function setupWater() {
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -1, 0);

  water.material.transparent = true;
  water.material.depthWrite = false;

  rootScene.add(water);
}

export function updateWater() {
  water.material.uniforms['time'].value += 1 / 700;
}
