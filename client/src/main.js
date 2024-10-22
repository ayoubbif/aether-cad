import * as THREE from 'three';
import { Scene } from './core/scene';
import { Renderer } from './core/renderer';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class AetherEngine {
  constructor() {
    this.init();
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.animate();
  }

  init(){
    this.viewport = document.querySelector('.viewport');
    this.canvas = document.getElementById('three-canvas');
  }

  setupScene() {
    this.sceneManager = new Scene(this.viewport);
    this.scene = this.sceneManager.getScene();
  }

  setupRenderer() {
    this.renderer = new Renderer(this.canvas, this.viewport);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.viewport.clientWidth / this.viewport.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 10);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const app = new AetherEngine();
