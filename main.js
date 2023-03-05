import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import VertexShader from './shaders/vertex.glsl'
import FragmentShader from './shaders/fragment.glsl'
import VertexShader2 from './shaders/vertex2.glsl'
import FragmentShader2 from './shaders/fragment2.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {DotScreenShader} from './customShader'
/**
 * Base
 */

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Plane
 */
const SphereGeometry = new THREE.SphereGeometry(1.5,32,32);
const planeMaterial = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    vertexShader:VertexShader,
    fragmentShader:FragmentShader,
    uniforms:{
      uTime:{value:0},
    }
})
const mesh = new THREE.Mesh(SphereGeometry,planeMaterial);
scene.add(mesh)

const smallSphereGeometry = new THREE.SphereGeometry(0.4,32,32);
const smallPlaneMaterial = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    vertexShader:VertexShader2,
    fragmentShader:FragmentShader2,
    uniforms:{
      uTime:{value:0},
      tCube:{value:0}
    }
})
const smallSphere = new THREE.Mesh(smallSphereGeometry,smallPlaneMaterial);
scene.add(smallSphere)

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
  256,{
    format:THREE.RGBAFormat,
    generateMipmaps:true,
    minFilter:THREE.LinearMipmapLinearFilter,
    encoding:THREE.sRGBEncoding
  }
);
 const cubeCamera = new THREE.CubeCamera(0.1,10,cubeRenderTarget);
/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
// scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
// directionalLight.position.set(5, 5, 5);
// scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableZoom = false;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.ACESFilmicToneMapping
const composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );

const effect1 = new ShaderPass( DotScreenShader );
effect1.uniforms[ 'scale' ].value = 4;
composer.addPass( effect1 );
composer.setSize(sizes.width, sizes.height);
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  planeMaterial.uniforms.uTime.value = elapsedTime
  
  // Update controls
  controls.update()
  smallSphere.visible = false;
  cubeCamera.update(renderer,scene)
  smallSphere.visible = true;
  smallPlaneMaterial.uniforms.tCube.value = cubeRenderTarget.texture;
  // Render
  // renderer.render(scene, camera);
  composer.render(scene,camera);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
