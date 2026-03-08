/**
 * Xenonite Cage
 * A geodesic icosahedron enclosure — glass faces + metallic struts.
 */

import * as THREE from 'three';

let cageGroup;

export function createCage(scene) {
  cageGroup = new THREE.Group();
  const radius = 2.2;
  const detail = 1;

  // Shared geometry
  const icoGeo = new THREE.IcosahedronGeometry(radius, detail);

  // ---- Glass Faces ----
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    transmission: 1.0,
    opacity: 1.0,
    transparent: true,
    metalness: 0.0,
    roughness: 0.05,
    ior: 1.65,
    thickness: 0.5,
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
    color: new THREE.Color(0xffffff),
    attenuationColor: new THREE.Color(0xccddff),
    attenuationDistance: 8.0
  });

  const glassMesh = new THREE.Mesh(icoGeo, glassMaterial);
  glassMesh.renderOrder = 1;
  cageGroup.add(glassMesh);

  // ---- Wireframe Struts ----
  const edges = new THREE.EdgesGeometry(icoGeo);
  const strutMaterial = new THREE.LineBasicMaterial({
    color: 0x2a2a2a,
    linewidth: 1
  });
  const strutLines = new THREE.LineSegments(edges, strutMaterial);
  cageGroup.add(strutLines);

  // Also add thin tubes along edges for more visible struts
  addTubeStruts(icoGeo, radius, detail);

  scene.add(cageGroup);
  return cageGroup;
}

function addTubeStruts(icoGeo, radius, detail) {
  const strutMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.8,
    roughness: 0.4
  });

  // Extract unique edges from the icosahedron
  const positions = icoGeo.attributes.position;
  const index = icoGeo.index;
  const edgeSet = new Set();
  const edges = [];

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  function addEdge(i1, i2) {
    const key = Math.min(i1, i2) + ':' + Math.max(i1, i2);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([i1, i2]);
    }
  }

  // Create a tube for each edge
  const tubeRadius = 0.015;
  for (const [i1, i2] of edges) {
    const v1 = new THREE.Vector3(
      positions.getX(i1), positions.getY(i1), positions.getZ(i1)
    );
    const v2 = new THREE.Vector3(
      positions.getX(i2), positions.getY(i2), positions.getZ(i2)
    );

    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(v2, v1);
    const len = dir.length();
    dir.normalize();

    const tubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, len, 4, 1);
    const tube = new THREE.Mesh(tubeGeo, strutMat);

    tube.position.copy(mid);

    // Align cylinder to edge direction
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    tube.quaternion.copy(quat);

    tube.castShadow = true;
    cageGroup.add(tube);
  }
}

export function animateCage(elapsed) {
  if (!cageGroup) return;
  // Very slow rotation
  cageGroup.rotation.y = elapsed * 0.05;
  cageGroup.rotation.x = Math.sin(elapsed * 0.03) * 0.02;
}
