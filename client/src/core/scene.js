import * as THREE from 'three';

export class Scene {
  constructor(viewport) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Set background to black

    // Initialize scene elements
    this.init();
  }

  init() {
    // Add grid, ambient light, and base plane to the scene
    this.addGridHelper();
    this.addAmbientLight();
    this.addBasePlane();
  }

  addGridHelper() {
    // Add a grid helper to the scene (20x20 grid, dark gray lines)
    const gridHelper = new THREE.GridHelper(20, 20, 0x404040, 0x404040);
    this.scene.add(gridHelper);
  }

  addAmbientLight() {
    // Add ambient light with white color and 50% intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }

  addBasePlane() {
    // Add a simple base plane with light gray color
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      side: THREE.DoubleSide
    });
    this.basePlane = new THREE.Mesh(geometry, material);

    // Rotate the plane to lie flat on the ground
    this.basePlane.rotation.x = -Math.PI / 2;
    this.basePlane.position.y = -0.01; // Slight offset to avoid z-fighting
    this.scene.add(this.basePlane);
  }

  getBasePlane() {
    // Return the base plane mesh
    return this.basePlane;
  }

  getScene() {
    // Return the full scene object
    return this.scene;
  }
}
