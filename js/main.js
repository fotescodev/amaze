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

  try {
    // Initialize Three.js scene
    const { scene, renderer } = initScene(threeCanvas);

    // Create 3D objects
    createCage(scene);
    createRocky(scene);

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

    // Start render loop
    const rimLight = getRimLight();

    animate((delta, elapsed) => {
      animateCage(elapsed);
      animateRocky(elapsed, delta);

      if (rimLight) {
        rimLight.intensity = 2.0 + Math.sin(elapsed * 3) * 0.2 + Math.sin(elapsed * 7.3) * 0.1;
      }
    });
  } catch (err) {
    console.error('Init error:', err);
    loadingOverlay.classList.add('hidden');
  }
});
