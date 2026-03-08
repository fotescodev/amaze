/**
 * Three.js Scene Setup
 * Initializes renderer, camera, lights, environment, and post-processing.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer, controls;
let rimLight;
let useComposer = true;
const clock = new THREE.Clock();

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || window.innerWidth < 768;

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRimLight() { return rimLight; }

export function initScene(canvas) {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050508);

  // Camera
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.5, 6);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  if (isMobile) {
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  } else {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // Lights
  setupLights();

  // Environment map (procedural)
  setupEnvironment();

  // Post-processing (skip on mobile — bloom can cause black screen)
  if (!isMobile) {
    setupPostProcessing();
  } else {
    useComposer = false;
  }

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI * 0.75;
  controls.minPolarAngle = Math.PI * 0.2;
  controls.enablePan = false;

  // Handle resize
  handleResize();
  window.addEventListener('resize', handleResize);

  return { scene, camera, renderer };
}

function setupLights() {
  // Ambient
  const ambient = new THREE.AmbientLight(0x404050, isMobile ? 0.8 : 0.4);
  scene.add(ambient);

  // Key light (directional with shadows)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 8, 3);

  if (!isMobile) {
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
  }
  scene.add(keyLight);

  // Rim light (orange, behind/left — hints at high-heat environment)
  rimLight = new THREE.PointLight(0xffaa00, 2.0, 20);
  rimLight.position.set(-4, 2, -4);
  scene.add(rimLight);

  // Fill light (cool blue, front/right)
  const fillLight = new THREE.PointLight(0x88bbff, 1.0, 20);
  fillLight.position.set(4, -1, 2);
  scene.add(fillLight);
}

function setupEnvironment() {
  // Procedural environment cube texture for reflections
  const size = 128;

  const colors = [
    ['#1a1a24', '#0a0a12'], // px
    ['#141420', '#080810'], // nx
    ['#20202c', '#0c0c14'], // py (top - slightly brighter)
    ['#0a0a10', '#050508'], // ny (bottom - darker)
    ['#181822', '#0a0a12'], // pz
    ['#141420', '#080810'], // nz
  ];

  const images = [];

  for (const [c1, c2] of colors) {
    // Each face needs its own canvas
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = size;
    faceCanvas.height = size;
    const ctx = faceCanvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Add subtle noise dots for realism
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 30 + 20;
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness + 10}, 0.3)`;
      ctx.fillRect(x, y, 1, 1);
    }

    images.push(faceCanvas);
  }

  const cubeTexture = new THREE.CubeTexture(images);
  cubeTexture.needsUpdate = true;
  scene.environment = cubeTexture;
}

function setupPostProcessing() {
  const container = renderer.domElement.parentElement;
  const w = container.clientWidth;
  const h = container.clientHeight;

  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    0.3,  // strength
    0.5,  // radius
    0.8   // threshold
  );
  composer.addPass(bloomPass);
}

function handleResize() {
  const container = renderer.domElement.parentElement;
  if (!container) return;

  const w = container.clientWidth;
  const h = container.clientHeight;

  if (w === 0 || h === 0) return;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);

  if (composer) {
    composer.setSize(w, h);
  }
}

export function animate(callback) {
  function loop() {
    requestAnimationFrame(loop);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    controls.update();

    if (callback) callback(delta, elapsed);

    if (useComposer && composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
  loop();
}
