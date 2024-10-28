import * as THREE from 'three';

export class Camera {
  constructor(viewport) {
    this.viewport = viewport;
    this.init();
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      this.viewport.clientWidth / this.viewport.clientHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    this.camera.position.set(0, 10, 10);
  }

  resize() {
    this.camera.aspect = this.viewport.clientWidth / this.viewport.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  getCamera() {
    return this.camera;
  }

  lookAt(x, y, z) {
    this.camera.lookAt(x, y, z);
  }
}
