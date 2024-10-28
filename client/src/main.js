import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { Camera } from './core/camera';
import { Controls } from './core/controls';
import { ToolManager } from './core/managers/tool-manager';
import { UIManager } from './core/managers/ui-manager';

export class AetherEngine {
  constructor() {
    this.initialize = this.initialize();
  }

  /**
   * Orchestrates the engine initialization sequence:
   * 1. Waits for DOM to be ready
   * 2. Sets up core engine components
   * 3. Binds window event handlers
   * 4. Starts the render loop
   */
  async initialize() {
    try {
      await this.waitForDOM();
      this.initializeEngine();
      this.setupWindowHandlers();
      this.startRenderLoop();
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensures DOM is fully loaded before proceeding with initialization.
   * This prevents race conditions with DOM element access.
   */
  async waitForDOM() {
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    this.validateDOMElements();
  }

  /**
   * Validates presence of required DOM elements.
   */
  validateDOMElements() {
    this.viewport = document.querySelector('.viewport');
    this.canvas = document.querySelector('#three-canvas');

    if (!this.viewport || !this.canvas) {
      throw new Error('Required DOM elements not found');
    }
  }

  /**
   * Initializes all core engine components and managers.
   * Order is important here as some managers depend on others being initialized first.
   *
   * TODO: Consider implementing dependency injection for better testing and modularity
   */
  initializeEngine() {
    // Core components
    this.sceneManager = new Scene();
    this.scene = this.sceneManager.getScene();
    this.renderer = new Renderer(this.canvas, this.viewport);
    this.cameraManager = new Camera(this.viewport);
    this.camera = this.cameraManager.getCamera();
    this.controlsManager = new Controls(this.camera, this.canvas);
    this.controls = this.controlsManager.getControls();

    // Tool and UI management
    this.toolManager = new ToolManager(
      this.scene,
      this.camera,
      this.renderer.getRenderer()
    );

    // UI should be initialized last as it may depend on all other systems
    new UIManager(this.sceneManager, this.toolManager);
  }

  /**
   * Sets up window event handlers for responsive behavior.
   */
  setupWindowHandlers() {
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Handles viewport resize events by updating renderer and camera
   * Optional chaining used in case this is called before full initialization
   */
  handleResize() {
    this.renderer?.resize();
    this.cameraManager?.resize();
  }

  /**
   * Initiates the main render loop
   * Uses requestAnimationFrame for optimal performance and browser compatibility
   *
   * TODO: Consider implementing a fixed time step for physics/animations if needed
   */
  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controlsManager.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}

// Instantiate the engine
new AetherEngine();
