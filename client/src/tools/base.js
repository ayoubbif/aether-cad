import * as THREE from 'three';

export class BaseTool {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.isActive = false;
    this.handlers = new Map();
  }

  activate() {
    this.isActive = true;
    this.updateCursor();
  }

  deactivate() {
    this.isActive = false;
    this.updateCursor();
  }

  updateCursor() {
    document.body.style.cursor = this.isActive ? this.getCursorStyle() : 'default';
  }

  getCursorStyle() {
    return 'default';
  }

  setupEventListeners(eventMap) {
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      const boundHandler = handler.bind(this);
      const element = this.getEventTarget(eventName);

      element.addEventListener(eventName, boundHandler);
      this.handlers.set(eventName, boundHandler);
    });
  }

  getEventTarget(eventName) {
    return eventName === 'keydown' ? window : this.renderer.domElement;
  }

  getIntersectionPoint(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);
    return this.raycaster.intersectObjects(this.scene.children);
  }

  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    this.renderer.domElement.dispatchEvent(event);
  }

  dispose() {
    this.handlers.forEach((handler, eventName) => {
      const element = this.getEventTarget(eventName);
      element.removeEventListener(eventName, handler);
    });
    this.handlers.clear();
  }

  removeFromScene(object) {
    if (!object) return;

    this.scene.remove(object);
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  }
}
