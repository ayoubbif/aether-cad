import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { Camera } from './core/camera';
import { Controls } from './core/controls';

export class AetherEngine {
  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.init();
    this.setupCore();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.viewport = document.querySelector('.viewport');
    this.canvas = document.querySelector('#three-canvas');

    if (!this.viewport || !this.canvas) {
      throw new Error('Required DOM elements not found');
    }
  }

  setupCore() {
    // Initialize core components
    this.sceneManager = new Scene(this.viewport);
    this.scene = this.sceneManager.getScene();

    this.renderer = new Renderer(this.canvas, this.viewport);

    this.cameraManager = new Camera(this.viewport);
    this.camera = this.cameraManager.getCamera();

    this.controlsManager = new Controls(this.camera, this.canvas);
    this.controls = this.controlsManager.getControls();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (this.renderer) {
      this.renderer.resize();
    }
    if (this.cameraManager) {
      this.cameraManager.resize();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controlsManager.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new AetherEngine();
});
