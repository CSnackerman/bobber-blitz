import {
  FrontSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  Scene,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import { Sky } from 'three/examples/jsm/Addons.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { delta } from '../core/clock';
import { renderer } from '../core/renderer';
import { camera } from './camera';
import { rootScene } from './scene';
import { water } from './water';
import { getSunColor } from './sun';

const sun = new Vector3();
const sky = new Sky();
let sunMesh: Mesh;

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

  sceneEnv.add(sky);
  renderTarget = pmremGenerator.fromScene(sceneEnv);
  rootScene.add(sky);

  rootScene.environment = renderTarget.texture;

  // decal
  const sunDecal = new TextureLoader().load('/sun_decal2.png');

  const decalMat = new MeshBasicMaterial({
    map: sunDecal,
    side: FrontSide,
    transparent: true,
    color: getSunColor(),
  });

  const decalGeometry = new PlaneGeometry(11000, 11000);

  sunMesh = new Mesh(decalGeometry, decalMat);

  sunMesh.position.setFromSphericalCoords(100000, phi, theta);

  sunMesh.lookAt(camera.position);

  rootScene.add(sunMesh);
}

export function updateSun() {
  sunMesh.rotateZ(degToRad(5) * delta);
  // const color = (sunMesh.material as MeshBasicMaterial).color;
  // const currentColor = color.clone();
  // const newColor = new Color((currentColor.getHex() + 1) % 16777216);
  // color.set(newColor);
}
