import * as THREE from 'three';

/**
 * BaseTool - Core class for implementing interactive 3D tools
 *
 * This class provides fundamental infrastructure for creating tools that interact
 * with a Three.js scene. It handles raycasting, event management, and tool state.
 * Common use cases include selection tools, manipulation handles, and drawing tools.
 */
export class BaseTool {
  /**
   * @param {THREE.Scene} scene - The Three.js scene this tool will operate in
   * @param {THREE.Camera} camera - The camera used for raycasting and perspective
   * @param {THREE.WebGLRenderer} renderer - The renderer whose canvas we'll attach events to
   */
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Set up raycaster with default values - tools typically update these during use
    // Using -Z as default direction since that's "into" the screen in Three.js
    const origin = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, -1);
    direction.normalize();

    this.raycaster = new THREE.Raycaster(origin, direction);

    // Track tool state and event handlers for cleanup
    this.isActive = false;
    this.handlers = new Map();
  }

  /**
   * Activates the tool and updates cursor styling
   * Override in subclasses to add initialization logic
   */
  activate() {
    this.isActive = true;
    this.updateCursor();
  }

  /**
   * Deactivates the tool and resets cursor
   * Override in subclasses to add cleanup logic
   */
  deactivate() {
    this.isActive = false;
    this.updateCursor();
  }

  /**
   * Updates cursor based on tool state
   * Should be called whenever tool state changes that would affect cursor appearance
   */
  updateCursor() {
    document.body.style.cursor = this.isActive
      ? this.getCursorStyle()
      : 'default';
  }

  /**
   * Returns cursor style for active tool state
   * Override in subclasses to provide tool-specific cursors
   * @returns {string} CSS cursor value
   */
  getCursorStyle() {
    return 'default';
  }

  /**
   * Sets up event listeners with automatic binding and cleanup registration
   * @param {Object} eventMap - Map of event names to handler functions
   */
  setupEventListeners(eventMap) {
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      const boundHandler = handler.bind(this);
      const element = this.getEventTarget(eventName);

      element.addEventListener(eventName, boundHandler);
      this.handlers.set(eventName, boundHandler);
    });
  }

  /**
   * Determines appropriate event target based on event type
   * Keyboard events go to window, pointer events go to renderer canvas
   * @param {string} eventName - Name of the event
   * @returns {EventTarget} - DOM element to attach the event to
   */
  getEventTarget(eventName) {
    return eventName === 'keydown' ? window : this.renderer.domElement;
  }

  /**
   * Performs raycasting from current mouse position into the scene
   * Essential for converting 2D mouse coordinates to 3D space
   * @param {MouseEvent} event - Mouse event containing cursor position
   * @returns {Array<THREE.Intersection>} Array of intersections with scene objects
   */
  getIntersectionPoint(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);
    return this.raycaster.intersectObjects(this.scene.children);
  }

  /**
   * Emits custom events from the renderer element
   * Useful for tool-specific events like selection changes or operation completion
   * @param {string} eventName - Name of the custom event
   * @param {Object} data - Event data to be included in detail property
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    this.renderer.domElement.dispatchEvent(event);
  }

  /**
   * Cleans up all event listeners registered through setupEventListeners
   * Should be called when tool is being destroyed to prevent memory leaks
   */
  dispose() {
    this.handlers.forEach((handler, eventName) => {
      const element = this.getEventTarget(eventName);
      element.removeEventListener(eventName, handler);
    });
    this.handlers.clear();
  }
}
