import * as THREE from 'three';
import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { Camera } from './core/camera';
import { Controls } from './core/controls';
import { DrawTool } from './tools/draw';
import { SelectTool } from './tools/select';
import { SatelliteImageService } from './services/satellite-image-service';

export class AetherEngine {
  constructor() {
    this.tools = new Map();
    this.initializationPromise = this.initialize();
  }

  async initialize() {
    try {
      await this.waitForDOM();
      this.initializeComponents();
      this.setupEventHandlers();
      this.startRenderLoop();
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  async waitForDOM() {
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    this.validateDOMElements();
  }

  validateDOMElements() {
    this.viewport = document.querySelector('.viewport');
    this.canvas = document.querySelector('#three-canvas');

    if (!this.viewport || !this.canvas) {
      throw new Error('Required DOM elements not found');
    }
  }

  initializeComponents() {
    this.sceneManager = new Scene();
    this.scene = this.sceneManager.getScene();
    this.renderer = new Renderer(this.canvas, this.viewport);
    this.cameraManager = new Camera(this.viewport);
    this.camera = this.cameraManager.getCamera();
    this.controlsManager = new Controls(this.camera, this.canvas);
    this.controls = this.controlsManager.getControls();

    // Initialize tools
    this.initializeTools();
    this.setupToolButtons();
  }

  initializeTools() {
    const rendererInstance = this.renderer.getRenderer();

    // Initialize tools and store them in the tools Map
    this.tools.set(
      'select',
      new SelectTool(this.scene, this.camera, rendererInstance)
    );
    this.tools.set(
      'draw',
      new DrawTool(this.scene, this.camera, rendererInstance)
    );

    // Setup event listeners for selection tool
    rendererInstance.domElement.addEventListener('objectSelected', (event) => {
      console.log('Object selected:', event.detail.object);
    });

    rendererInstance.domElement.addEventListener('objectDeleted', () => {
      console.log('Object deleted');
    });
  }

  setupToolButtons() {
    const toolButtons = document.querySelectorAll('.tool-button');

    toolButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        // Deactivate all tools first
        this.deactivateAllTools();

        // Remove active class from all buttons
        toolButtons.forEach((btn) => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Activate the appropriate tool
        if (button.querySelector('.fa-mouse-pointer')) {
          this.tools.get('select').activate();
        } else if (button.querySelector('.fa-pencil-alt')) {
          this.tools.get('draw').activate();
        }
        // Add other tool activations as needed
      });
    });
  }

  deactivateAllTools() {
    for (const tool of this.tools.values()) {
      tool.deactivate();
    }
  }

  setupEventHandlers() {
    this.setupResizeHandler();
    this.setupLayerToggles();
    this.setupImageFetching();
  }

  setupResizeHandler() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  setupLayerToggles() {
    const layerToggles = {
      layer1: 'image',
      layer2: 'grid'
    };

    Object.entries(layerToggles).forEach(([elementId, layerType]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', (event) => {
          this.sceneManager.toggleLayerVisibility(
            layerType,
            event.target.checked
          );
        });
      }
    });
  }

  setupImageFetching() {
    const fetchButton = document.getElementById('fetch-image');
    if (fetchButton) {
      fetchButton.addEventListener('click', () => this.fetchSatelliteImage());
    }
  }

  async fetchSatelliteImage() {
    try {
      const params = this.getImageParameters();
      const imageUrl = await SatelliteImageService.fetchImage(...params);
      await this.loadSatelliteTexture(imageUrl);
    } catch (error) {
      console.error('Failed to fetch satellite image:', error);
    }
  }

  getImageParameters() {
    return ['latitude', 'longitude', 'zoom'].map((id) => {
      const element = document.getElementById(id);
      return element ? element.value : null;
    });
  }

  loadSatelliteTexture(imageUrl) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        imageUrl,
        (texture) => {
          this.sceneManager.setImage(texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  handleResize() {
    this.renderer?.resize();
    this.cameraManager?.resize();
  }

  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controlsManager.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}

const app = new AetherEngine();
