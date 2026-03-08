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

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const threeCanvas = document.getElementById('three-canvas');
  const vizCanvas = document.getElementById('visualizer-canvas');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Initialize Three.js scene
  const { scene } = initScene(threeCanvas);

  // Create 3D objects
  createCage(scene);
  createRocky(scene);

  // Initialize audio (lazy — context created on first user gesture)
  // Pre-create analyser for visualizer binding
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

  // Start render loop
  const rimLight = getRimLight();

  animate((delta, elapsed) => {
    // Animate cage rotation
    animateCage(elapsed);

    // Animate Rocky (breathing, idle, translation reaction)
    animateRocky(elapsed, delta);

    // Subtle rim light flicker (heat shimmer effect)
    if (rimLight) {
      rimLight.intensity = 2.0 + Math.sin(elapsed * 3) * 0.2 + Math.sin(elapsed * 7.3) * 0.1;
    }
  });

  console.log('Eridian Translator initialized.');
});
