import {
  BoxGeometry,
  Color,
  Data3DTexture,
  FrontSide,
  GLSL3,
  LinearFilter,
  Mesh,
  Object3DEventMap,
  RawShaderMaterial,
  RedFormat,
  Vector3,
} from 'three';
import { clamp, degToRad, randFloat } from 'three/src/math/MathUtils.js';
import { delta } from '../core/clock';
import { isMobile } from '../util/device';
import { getRandomFloat, getRandomInt } from '../util/random';

import { rootScene } from './scene';

export {
  TextureSize as CloudTextureSize,
  preCalcTextures as preCalcCloudTextures,
  setupAll as setupClouds,
  update as updateClouds,
};

// worker
import CloudTextureWorker from '../workers/cloud_worker?worker';

// shaders
import fragmentShader from '../shaders/cloud.frag.glsl?raw';
import vertexShader from '../shaders/cloud.vert.glsl?raw';

const clouds: Mesh<BoxGeometry, RawShaderMaterial, Object3DEventMap>[] = [];
const cloudTextures: Data3DTexture[] = [];
const TextureSize = 128;

const N_CLOUDS_MOBILE = 10;
const N_CLOUDS_DESKTOP = 42;
const N_CLOUDS = isMobile() ? N_CLOUDS_MOBILE : N_CLOUDS_DESKTOP;

const minScale = 5000;
const maxScale = 50000;
const minHeight = 5000;
const maxHeight = 7000;
const disappearDistance = 100000;
const spawnWidth = 100000;
const minElevation = maxHeight * 2 + 1000;
const maxElevation = minElevation + 1000;

function setupAll() {
  for (let t = 0; t < N_CLOUDS; t++) {
    setup(t);
  }
}

async function preCalcTextures() {
  const promises: Promise<void>[] = [];
  for (let i = 0; i < N_CLOUDS; i++) {
    promises.push(
      new Promise((resolve) => {
        const cloudTextureWorker = new CloudTextureWorker();
        cloudTextureWorker.postMessage(null);
        cloudTextureWorker.onmessage = (e: MessageEvent<Uint8Array>) => {
          const texture = createTexture(e.data);
          cloudTextures.push(texture);
          resolve();
          cloudTextureWorker.terminate();
        };
      })
    );
  }

  await Promise.all(promises);
}

function setup(t: number) {
  const material = new RawShaderMaterial({
    glslVersion: GLSL3,
    uniforms: {
      base: { value: new Color(0xe0e0e0) },
      map: { value: cloudTextures[t] },
      cameraPos: { value: new Vector3() },
      threshold: { value: randFloat(0.3, 0.5) },
      opacity: { value: 0.25 },
      range: { value: 0.1 },
      steps: { value: isMobile() ? 10 : 25 }, // performance
      frame: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    side: FrontSide,
    transparent: true,
    depthWrite: false,
  });

  const geometry = new BoxGeometry(1, 1, 1);
  const cloud = new Mesh(geometry, material);

  initTransform(cloud);
  randomizeScale(cloud);

  rootScene.add(cloud);
  clouds.push(cloud);
}

function update() {
  for (const cloud of clouds) {
    cloud.translateX(-1000 * delta);
    cloud.translateY(-50 * delta);

    if (cloud.position.x < -disappearDistance / 2) {
      shrink(cloud);
    }

    if (cloud.position.y < 0 || isNegativeScale(cloud)) {
      reset(cloud);
    }
  }
}

function initTransform(cloud: Mesh) {
  cloud.setRotationFromAxisAngle(new Vector3(0, 1, 0), degToRad(-33));

  cloud.position.set(
    getRandomFloat(-disappearDistance / 2, disappearDistance / 2),
    getRandomFloat(minElevation, maxElevation),
    getRandomFloat(-spawnWidth, spawnWidth)
  );
}

function randomizeScale(cloud: Mesh) {
  const first = getRandomFloat(minScale, maxScale);
  const second =
    getRandomInt(0, 1) === 0
      ? first + getRandomFloat(50, 1000)
      : first - getRandomFloat(50, 1000);

  cloud.scale.set(first, getRandomFloat(minHeight, maxHeight), second);
}

function reset(cloud: Mesh) {
  cloud.position.set(
    randFloat(0, maxScale),
    randFloat(minElevation, maxElevation),
    randFloat(-spawnWidth, spawnWidth)
  );

  randomizeScale(cloud);
}

function shrink(cloud: Mesh) {
  const shrinkAmt = 1000 * delta;
  const s = cloud.scale.clone();

  const newX = clamp(s.x - shrinkAmt, 1, maxScale);
  const newY = clamp(s.y - shrinkAmt, 1, maxHeight);
  const newZ = clamp(s.z - shrinkAmt, 1, maxScale);

  cloud.scale.set(newX, newY, newZ);
}

function isNegativeScale(cloud: Mesh) {
  const s = cloud.scale;

  if (s.x <= 1 && s.y <= 1 && s.z <= 1) {
    return true;
  }

  return false;
}

function createTexture(data: Uint8Array) {
  const texture = new Data3DTexture(
    data,
    TextureSize,
    TextureSize,
    TextureSize
  );
  texture.format = RedFormat;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  return texture;
}
