import * as THREE from 'three';
import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { Camera } from './core/camera';
import { Controls } from './core/controls';
import { SatelliteImageService } from './services/satellite-image-service';

export class AetherEngine {
  constructor() {
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
      await new Promise(resolve => {
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
          this.sceneManager.toggleLayerVisibility(layerType, event.target.checked);
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
    return ['latitude', 'longitude', 'zoom'].map(id => {
      const element = document.getElementById(id);
      return element ? element.value : null;
    });
  }

  loadSatelliteTexture(imageUrl) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        imageUrl,
        texture => {
          this.sceneManager.setSatelliteImage(texture);
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

