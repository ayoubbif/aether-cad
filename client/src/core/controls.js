import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.init();
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.setupControlsConfig();
  }

  setupControlsConfig() {
    // Configure OrbitControls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  update() {
    this.controls.update();
  }

  getControls() {
    return this.controls;
  }
}
