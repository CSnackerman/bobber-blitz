import {
  MathUtils,
  PMREMGenerator,
  Scene,
  Texture,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import { Sky } from 'three/examples/jsm/Addons.js';
import { renderer } from '../core/renderer';
import { rootScene } from './scene';
import { water } from './water';

const sun = new Vector3();
const sky = new Sky();

export function setupSky() {
  // scale the skybox
  sky.scale.setScalar(10000);

  // uniforms
  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 0.2;
  skyUniforms['rayleigh'].value = 0.03;
  skyUniforms['mieCoefficient'].value = 0;
  skyUniforms['mieDirectionalG'].value = 0;

  // config
  const parameters = {
    elevation: 30,
    azimuth: 250,
  };

  const pmremGenerator = new PMREMGenerator(renderer);
  const sceneEnv = new Scene();

  let renderTarget: WebGLRenderTarget<Texture> | null | undefined = null;

  const phi = MathUtils.degToRad(90 - parameters.elevation);
  const theta = MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms['sunPosition'].value.copy(sun);
  water.material.uniforms['sunDirection'].value.copy(sun).normalize();

  // renderTarget.dispose();

  sceneEnv.add(sky);
  renderTarget = pmremGenerator.fromScene(sceneEnv);
  rootScene.add(sky);

  rootScene.environment = renderTarget.texture;
}
