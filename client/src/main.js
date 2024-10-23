import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { Camera } from './core/camera';
import { Controls } from './core/controls';

export class AetherEngine {
  constructor() {
    // Check if DOM is ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.init(); // Get DOM elements
    this.setupCore();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    // Locate required DOM elements for rendering
    this.viewport = document.querySelector('.viewport');
    this.canvas = document.querySelector('#three-canvas');

    // Error handling if elements are missing
    if (!this.viewport || !this.canvas) {
      throw new Error('Required DOM elements not found');
    }
  }

  setupCore() {
    // Initialize core components: scene, renderer, camera, and controls
    this.sceneManager = new Scene(this.viewport);
    this.scene = this.sceneManager.getScene();

    this.renderer = new Renderer(this.canvas, this.viewport);

    this.cameraManager = new Camera(this.viewport);
    this.camera = this.cameraManager.getCamera();

    this.controlsManager = new Controls(this.camera, this.canvas);
    this.controls = this.controlsManager.getControls();
  }

  setupEventListeners() {
    // Update layout on window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    // Resize renderer and camera when window is resized
    if (this.renderer) {
      this.renderer.resize();
    }
    if (this.cameraManager) {
      this.cameraManager.resize();
    }
  }

  animate() {
    // Recursive animation loop
    requestAnimationFrame(() => this.animate());
    this.controlsManager.update(); // Update controls
    this.renderer.render(this.scene, this.camera); // Render the scene
  }
}

// Initialize the application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AetherEngine();
});
