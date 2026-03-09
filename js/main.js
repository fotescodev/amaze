/**
 * Main Entry Point
 * Initializes all modules: Three.js scene, Rocky, cage, audio, visualizer, UI.
 */

import { initScene, animate, getRimLight } from './scene.js';
import { createCage, animateCage } from './cage.js';
import { createRocky, animateRocky } from './rocky.js';
import { getAnalyser, getAudioContext } from './audio-engine.js';
import { initVisualizer } from './visualizer.js';
import { initUI } from './ui.js';

function debugLog(msg) {
  const el = document.getElementById('debug-log');
  if (el) {
    el.style.display = 'block';
    el.textContent += msg + '\n';
  }
  console.log('[DEBUG]', msg);
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const threeCanvas = document.getElementById('three-canvas');
  const vizCanvas = document.getElementById('visualizer-canvas');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Check canvas container dimensions
  const container = document.getElementById('canvas-container');
  debugLog('Container: ' + container.clientWidth + 'x' + container.clientHeight);
  debugLog('Canvas: ' + threeCanvas.clientWidth + 'x' + threeCanvas.clientHeight);
  debugLog('UA: ' + navigator.userAgent.substring(0, 80));

  // WebGL availability check
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
  if (!gl) {
    debugLog('WebGL NOT available!');
    loadingOverlay.classList.add('hidden');
    return;
  }
  debugLog('WebGL OK: ' + (gl instanceof WebGL2RenderingContext ? 'v2' : 'v1'));

  try {
    // Initialize Three.js scene
    debugLog('Initializing scene...');
    const { scene, renderer } = initScene(threeCanvas);
    debugLog('Scene OK');

    // Handle WebGL context loss
    threeCanvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      debugLog('WebGL context LOST!');
    });
    threeCanvas.addEventListener('webglcontextrestored', () => {
      debugLog('WebGL context restored');
    });

    // Create 3D objects
    debugLog('Creating cage...');
    createCage(scene);
    debugLog('Cage OK');

    debugLog('Creating Rocky...');
    createRocky(scene);
    debugLog('Rocky OK');

    // Initialize audio (lazy — context created on first user gesture)
    getAudioContext();
    const analyser = getAnalyser();

    // Initialize visualizer
    initVisualizer(vizCanvas, analyser);

    // Initialize UI handlers
    initUI();

    // Hide loading overlay
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 800);

    // Log scene children for debugging
    debugLog('Scene children: ' + scene.children.length);
    scene.traverse((obj) => {
      if (obj.isMesh) debugLog('  Mesh: ' + (obj.geometry.type || 'unknown') + ' at y=' + obj.position.y.toFixed(2));
    });

    // Start render loop
    const rimLight = getRimLight();

    animate((delta, elapsed) => {
      animateCage(elapsed);
      animateRocky(elapsed, delta);

      if (rimLight) {
        rimLight.intensity = 2.0 + Math.sin(elapsed * 3) * 0.2 + Math.sin(elapsed * 7.3) * 0.1;
      }
    });

    // Hide debug log after 10 seconds if no errors
    setTimeout(() => {
      const el = document.getElementById('debug-log');
      if (el && !window.__errors.length) {
        el.style.display = 'none';
      }
    }, 10000);

    debugLog('Init complete');
  } catch (err) {
    debugLog('INIT ERROR: ' + err.message + '\n' + err.stack);
    // Still hide overlay and show UI even if 3D fails
    loadingOverlay.classList.add('hidden');
  }
});
