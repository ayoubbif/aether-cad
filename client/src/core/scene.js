import * as THREE from 'three';
import { SCENE_CONFIG } from '../constants/scene-config';
import { GridLayer } from './layers/grid';
import { ImageLayer } from './layers/image';

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
    this.addLayer(new ImageLayer(this.scene));
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

  setImage(texture) {
    const imageLayer = this.getLayer('image');
    if (imageLayer) {
      imageLayer.updateTexture(texture);
    }
  }

  getScene() {
    return this.scene;
  }
}
