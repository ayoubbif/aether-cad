import * as THREE from 'three';
import {SatelliteImageService} from "../../services/satellite-image-service.js";

export class UIManager {
  constructor(sceneManager, toolManager) {
    this.sceneManager = sceneManager;
    this.toolManager = toolManager;
    this.setupToolButtons();
    this.setupLayerToggles();
    this.setupImageControls();
  }

  /**
   * Initializes tool selection buttons and their click handlers
   * Maps FontAwesome icon classes to tool names for dynamic tool activation
   *
   * TODO: Consider moving tool-to-icon mapping to a configuration file
   * TODO: Add keyboard shortcuts for tool selection
   * TODO: Consider adding tool tooltips/help text
   */
  setupToolButtons() {
    const toolButtons = document.querySelectorAll('.tool-button');
    const toolMap = {
      'fa-mouse-pointer': 'select',
      'fa-pencil-alt': 'draw',
      'fa-shapes': 'extrude'
    };

    toolButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.toolManager.deactivateAll();
        this.updateToolButtonStyles(toolButtons, button);

        // Activate the clicked tool
        for (const [iconClass, toolName] of Object.entries(toolMap)) {
          if (button.querySelector(`.${iconClass}`)) {
            this.toolManager.get(toolName).activate();
            break;
          }
        }
      });
    });
  }

  /**
   * Updates button styles to reflect the currently active tool
   *
   * @param {NodeList} allButtons - All tool buttons
   * @param {HTMLElement} activeButton - The currently active button
   */
  updateToolButtonStyles(allButtons, activeButton) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  /**
   * Sets up layer visibility toggle controls
   * Maps DOM element IDs to layer types
   *
   * TODO: Add layer opacity controls
   * TODO: Consider moving layer configuration to a settings file
   */
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

  /**
   * Initializes satellite image fetch controls
   *
   * TODO: Add loading indicator during fetch
   */
  setupImageControls() {
    const fetchButton = document.getElementById('fetch-image');
    if (fetchButton) {
      fetchButton.addEventListener('click', () => this.handleImageFetch());
    }
  }

  /**
   * Handles the satellite image fetch workflow:
   * 1. Collects parameters from UI
   * 2. Fetches image URL
   * 3. Loads image as texture
   */
  async handleImageFetch() {
    try {
      const params = this.getImageParameters();
      const imageUrl = await SatelliteImageService.fetchImage(...params);
      await this.loadSatelliteTexture(imageUrl);
    } catch (error) {
      console.error('Failed to fetch satellite image:', error);
    }
  }

  /**
   * Collects image parameters from UI inputs
   *
   * @returns {Array} Array of parameter values [latitude, longitude, zoom]
   */
  getImageParameters() {
    return ['latitude', 'longitude', 'zoom'].map(id => {
      const element = document.getElementById(id);
      return element ? element.value : null;
    });
  }

  /**
   * Loads an image URL as a THREE.js texture
   *
   * @param {string} imageUrl - URL of the image to load
   * @returns {Promise<THREE.Texture>} Loaded texture
   * TODO: Add loading progress feedback
   * TODO: Add texture caching
   */
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
}
