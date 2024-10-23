import * as THREE from 'three';
import { SCENE_CONFIG } from '../constants/scene-config';
import { GridLayer } from './layers/grid';
import { BasePlaneLayer } from './layers/base-plane';
import { SatelliteLayer } from './layers/image';

export class Scene {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.layers = new Map();
    this.init();
  }

  init() {
    this.initLighting();
    this.initLayers();
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(
      SCENE_CONFIG.LIGHT.COLOR,
      SCENE_CONFIG.LIGHT.INTENSITY
    );
    this.scene.add(ambientLight);
  }

  initLayers() {
    this.addLayer(new GridLayer(this.scene));
    this.addLayer(new BasePlaneLayer(this.scene));
    this.addLayer(new SatelliteLayer(this.scene));
  }

  addLayer(layer) {
    this.layers.set(layer.type, layer);
  }

  getLayer(type) {
    return this.layers.get(type);
  }

  toggleLayerVisibility(type, isVisible) {
    const layer = this.getLayer(type);
    if (layer) {
      layer.setVisibility(isVisible);
    }
  }

  setSatelliteImage(texture) {
    const satelliteLayer = this.getLayer('image');
    if (satelliteLayer) {
      satelliteLayer.updateTexture(texture);
    }
  }

  getScene() {
    return this.scene;
  }
}
