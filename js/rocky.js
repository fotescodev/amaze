/**
 * Procedural Rocky Mesh
 *
 * Based on reference images and book canon:
 * - Massive, bulky central body with cracked/fractured stone surface
 * - 5 thick, powerful limbs in radial pentagonal arrangement
 * - Green/teal glowing rings at joints (bio-luminescent)
 * - Blunt, clubbed stumps for hands (no fingers)
 * - Deep fracture lines across carapace
 * - Hunched forward posture, no distinct head
 */

import * as THREE from 'three';

let rockyGroup;
let bodyMesh;
let limbs = [];
let jointGlows = [];
const LIMB_COUNT = 5;
const ANGLE_STEP = (Math.PI * 2) / LIMB_COUNT;

// Animation state
let isTranslating = false;
let translationIntensity = 0;

export function createRocky(scene) {
  rockyGroup = new THREE.Group();

  // ---- Materials ----
  const normalMap = generateFractureNormalMap();

  // Main carapace — warm dark stone with heavy fractures
  const carapaceMat = new THREE.MeshStandardMaterial({
    color: 0x3d3530,        // warm brownish-gray stone
    roughness: 0.92,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(2.0, 2.0),
    flatShading: true
  });

  // Darker crevice material for joint gaps
  const creviceMat = new THREE.MeshStandardMaterial({
    color: 0x1a1612,
    roughness: 0.98,
    metalness: 0.0,
    flatShading: true
  });

  // Green/teal bio-luminescent joint rings
  const jointGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    emissive: 0x00cc66,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9
  });

  // ---- Central Body (massive, hunched) ----
  // Main torso — large, rounded, cracked boulder
  const bodyGeo = new THREE.DodecahedronGeometry(0.9, 2);
  scaleGeometry(bodyGeo, 1.1, 0.7, 1.0);   // wide, squashed
  displaceVertices(bodyGeo, 0.06);           // craggy surface
  bodyMesh = new THREE.Mesh(bodyGeo, carapaceMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.position.y = 0.2;
  rockyGroup.add(bodyMesh);

  // Upper carapace dome — the big hunched "head" mass
  const domeGeo = new THREE.IcosahedronGeometry(0.7, 2);
  scaleGeometry(domeGeo, 1.0, 0.55, 0.9);
  displaceVertices(domeGeo, 0.05);
  const domeMesh = new THREE.Mesh(domeGeo, carapaceMat);
  domeMesh.position.set(0, 0.55, 0.1); // slightly forward
  domeMesh.castShadow = true;
  rockyGroup.add(domeMesh);

  // Rear carapace plate
  const rearGeo = new THREE.IcosahedronGeometry(0.45, 1);
  scaleGeometry(rearGeo, 1.1, 0.5, 0.8);
  displaceVertices(rearGeo, 0.04);
  const rearMesh = new THREE.Mesh(rearGeo, carapaceMat);
  rearMesh.position.set(0, 0.3, -0.5);
  rearMesh.castShadow = true;
  rockyGroup.add(rearMesh);

  // ---- Shoulder Masses (where limbs connect) ----
  for (let i = 0; i < LIMB_COUNT; i++) {
    const angle = ANGLE_STEP * i - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Shoulder hump
    const shoulderGeo = new THREE.DodecahedronGeometry(0.3, 1);
    scaleGeometry(shoulderGeo, 1.2, 0.7, 1.0);
    displaceVertices(shoulderGeo, 0.03);
    const shoulder = new THREE.Mesh(shoulderGeo, carapaceMat);
    shoulder.position.set(cos * 0.7, 0.15, sin * 0.7);
    shoulder.castShadow = true;
    rockyGroup.add(shoulder);
  }

  // ---- Limbs (5x, thick and powerful) ----
  for (let i = 0; i < LIMB_COUNT; i++) {
    const angle = ANGLE_STEP * i - Math.PI / 2;
    const limbGroup = createLimb(angle, carapaceMat, creviceMat, jointGlowMat);
    limbs.push(limbGroup);
    rockyGroup.add(limbGroup);
  }

  // Position Rocky inside cage, low stance
  rockyGroup.position.y = -0.8;
  rockyGroup.scale.set(0.85, 0.85, 0.85);

  scene.add(rockyGroup);
  return rockyGroup;
}

function createLimb(angle, carapaceMat, creviceMat, jointGlowMat) {
  const group = new THREE.Group();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // ---- Upper Arm (thickest segment) ----
  const upperGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.65, 7);
  displaceVertices(upperGeo, 0.02);
  const upper = new THREE.Mesh(upperGeo, carapaceMat);
  upper.castShadow = true;
  upper.position.set(cos * 0.75, -0.1, sin * 0.75);
  // Tilt outward and downward
  const tiltAxis = new THREE.Vector3(-sin, 0, cos).normalize();
  upper.quaternion.setFromAxisAngle(tiltAxis, Math.PI * 0.35);
  group.add(upper);

  // ---- Joint Ring 1 (green glow) ----
  const joint1Geo = new THREE.TorusGeometry(0.16, 0.035, 8, 12);
  const joint1 = new THREE.Mesh(joint1Geo, jointGlowMat);
  joint1.position.set(cos * 1.0, -0.35, sin * 1.0);
  joint1.lookAt(0, -0.35, 0); // face inward
  jointGlows.push(joint1);
  group.add(joint1);

  // Dark crevice ring behind the glow
  const crev1Geo = new THREE.TorusGeometry(0.17, 0.02, 6, 12);
  const crev1 = new THREE.Mesh(crev1Geo, creviceMat);
  crev1.position.copy(joint1.position);
  crev1.lookAt(0, -0.35, 0);
  group.add(crev1);

  // ---- Forearm (still chunky) ----
  const foreGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.55, 7);
  displaceVertices(foreGeo, 0.018);
  const fore = new THREE.Mesh(foreGeo, carapaceMat);
  fore.castShadow = true;
  fore.position.set(cos * 1.2, -0.65, sin * 1.2);
  fore.quaternion.setFromAxisAngle(tiltAxis, Math.PI * 0.15);
  group.add(fore);

  // ---- Joint Ring 2 (green glow) ----
  const joint2Geo = new THREE.TorusGeometry(0.12, 0.03, 8, 12);
  const joint2 = new THREE.Mesh(joint2Geo, jointGlowMat);
  joint2.position.set(cos * 1.38, -0.9, sin * 1.38);
  joint2.lookAt(0, -0.9, 0);
  jointGlows.push(joint2);
  group.add(joint2);

  // ---- Lower Leg ----
  const lowerGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.4, 7);
  displaceVertices(lowerGeo, 0.015);
  const lower = new THREE.Mesh(lowerGeo, carapaceMat);
  lower.castShadow = true;
  lower.position.set(cos * 1.45, -1.1, sin * 1.45);
  group.add(lower);

  // ---- Stump / Club Hand ----
  // Wide, blunt, flat-ended — like a heavy stone club
  const stumpGeo = new THREE.DodecahedronGeometry(0.16, 0);
  scaleGeometry(stumpGeo, 1.3, 0.5, 1.2);
  displaceVertices(stumpGeo, 0.012);
  const stump = new THREE.Mesh(stumpGeo, carapaceMat);
  stump.castShadow = true;
  stump.position.set(cos * 1.5, -1.35, sin * 1.5);
  group.add(stump);

  // Rudimentary finger-like bumps on stump (3 per hand, per canon)
  for (let f = 0; f < 3; f++) {
    const fAngle = (f - 1) * 0.4;
    const fingerGeo = new THREE.BoxGeometry(0.05, 0.06, 0.04);
    displaceVertices(fingerGeo, 0.005);
    const finger = new THREE.Mesh(fingerGeo, carapaceMat);
    finger.position.set(
      cos * 1.58 + Math.cos(angle + fAngle) * 0.08,
      -1.4,
      sin * 1.58 + Math.sin(angle + fAngle) * 0.08
    );
    finger.castShadow = true;
    group.add(finger);
  }

  group.userData = { angle, upper, fore, lower, stump };
  return group;
}

// ---- Geometry Helpers ----

function scaleGeometry(geometry, sx, sy, sz) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) * sx);
    pos.setY(i, pos.getY(i) * sy);
    pos.setZ(i, pos.getZ(i) * sz);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

function displaceVertices(geometry, amount) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * amount);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * amount);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * amount);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Generate a fracture-line normal map that mimics cracked stone/ceramic.
 */
function generateFractureNormalMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base neutral normal
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // Draw fracture lines (dark cracks that create depth in normal map)
  ctx.strokeStyle = 'rgb(100, 100, 200)';
  ctx.lineWidth = 1.5;

  // Main fracture network
  for (let i = 0; i < 25; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    const segments = 3 + Math.floor(Math.random() * 6);
    for (let s = 0; s < segments; s++) {
      x += (Math.random() - 0.5) * 120;
      y += (Math.random() - 0.5) * 120;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Fine fractures
  ctx.strokeStyle = 'rgb(110, 110, 220)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    const segments = 2 + Math.floor(Math.random() * 3);
    for (let s = 0; s < segments; s++) {
      x += (Math.random() - 0.5) * 50;
      y += (Math.random() - 0.5) * 50;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Pixel-level noise for stone grain
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    // Keep blue channel mostly high (z-normal pointing outward)
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// ---- Animation ----

export function setTranslating(active, intensity = 1.0) {
  isTranslating = active;
  translationIntensity = intensity;
}

export function animateRocky(elapsed, delta) {
  if (!rockyGroup) return;

  // Idle breathing — subtle scale pulse
  const breathe = Math.sin(elapsed * 1.0) * 0.008;
  bodyMesh.scale.set(1 + breathe, 1 - breathe * 0.5, 1 + breathe);

  // Gentle body sway
  rockyGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.025;

  // Limb micro-sway
  for (let i = 0; i < limbs.length; i++) {
    const offset = i * ANGLE_STEP;
    const sway = Math.sin(elapsed * 0.6 + offset) * 0.006;
    limbs[i].position.y = sway;
  }

  // Joint glow pulse
  for (const joint of jointGlows) {
    const pulse = 0.6 + Math.sin(elapsed * 2.0 + joint.position.x * 3) * 0.3;
    joint.material.emissiveIntensity = pulse;
  }

  // Translation reaction
  if (isTranslating) {
    // Body vibration synced to audio
    const vibrate = Math.sin(elapsed * 30) * 0.004 * translationIntensity;
    rockyGroup.position.x = vibrate;
    rockyGroup.position.z = vibrate * 0.6;

    // Scale pulse
    const pulse = 1 + Math.sin(elapsed * 10) * 0.012 * translationIntensity;
    rockyGroup.scale.set(
      0.85 * pulse,
      0.85 * pulse,
      0.85 * pulse
    );

    // Joint glow intensifies during translation
    for (const joint of jointGlows) {
      joint.material.emissiveIntensity = 1.2 + Math.sin(elapsed * 6) * 0.5;
    }

    // Limbs shift more during translation
    for (let i = 0; i < limbs.length; i++) {
      const offset = i * ANGLE_STEP;
      const shift = Math.sin(elapsed * 4 + offset) * 0.015 * translationIntensity;
      limbs[i].position.y += shift;
    }
  } else {
    // Smoothly return to rest position
    rockyGroup.position.x *= 0.93;
    rockyGroup.position.z *= 0.93;
    const s = rockyGroup.scale.x;
    const target = 0.85;
    const lerped = s + (target - s) * 0.08;
    rockyGroup.scale.set(lerped, lerped, lerped);
  }
}
