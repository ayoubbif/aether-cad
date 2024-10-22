import * as THREE from 'three';

export class Renderer {
  constructor(canvas, viewport) {
    this.canvas = canvas;
    this.viewport = viewport;

    // Initialize the renderer
    this.init();
  }

  init() {
    // Create a WebGLRenderer with antialiasing and bind it to the canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    // Set the initial size of the renderer
    this.resize();
  }

  resize() {
    // Adjust renderer size based on the viewport dimensions
    const width = this.viewport.clientWidth;
    const height = this.viewport.clientHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  render(scene, camera) {
    // Render the scene using the provided camera
    this.renderer.render(scene, camera);
  }
}
