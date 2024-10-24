import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';
import { ExtrudeUI } from './ui/extrude-ui';
export class ExtrudeTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);
    this.initializeProperties();
    this.setupEventListeners();
    this.initializeUI();
  }

  // Initialize properties
  initializeProperties() {
    this.selectedObject = null;
    this.materials = new MaterialManager();
  }

  // Event listener setup
  setupEventListeners() {
    super.setupEventListeners({
      mousedown: this.onMouseDown.bind(this),
      keydown: this.onKeyDown.bind(this)
    });
  }

  // Initialize UI
  initializeUI() {
    this.ui = new ExtrudeUI(this.renderer.domElement.parentElement);
    this.ui.setHeightChangeHandler(this.handleHeightInputChange.bind(this));
  }

  handleHeightInputChange(newHeight) {
    if (this.isValidHeight(newHeight)) {
      this.extrudePolygon(this.selectedObject, newHeight);
      this.emit('extrudeComplete', {
        object: this.selectedObject,
        height: newHeight
      });
    }
  }

  isValidHeight(height) {
    return !isNaN(height) && height >= 0.01;
  }

  // Tool Interactions
  getCursorStyle() {
    return 'cell';
  }

  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);
    const intersection = intersects.find(intersect => this.isValidIntersection(intersect));
    return intersection?.object; // Return the actual mesh object
  }

  isValidIntersection(intersect) {
    const object = intersect.object;
    return (
      object instanceof THREE.Mesh &&
      !object.userData?.isVertex &&
      (object.geometry instanceof THREE.ShapeGeometry ||
        object.geometry instanceof THREE.ExtrudeGeometry)
    );
  }

  // Event Handlers
  onMouseDown(event) {
    if (!this.isActive) return;

    const intersectedObject = this.getIntersectionPoint(event);
    if (intersectedObject) {
      this.handleObjectSelection(intersectedObject);
    }
  }

  handleObjectSelection(object) {
    if (!object?.userData) {
      console.error('Invalid object selected');
      return;
    }

    this.selectedObject = object;
    const currentHeight = object.userData.extrudeHeight || 0;

    if (!object.userData.markerPoints) {
      console.error('No marker points found for polygon');
      return;
    }

    this.ui.show(currentHeight);
    this.emit('objectSelected', { object });
  }

  onKeyDown(event) {
    if (!this.isActive) return;
    if (event.key === 'Escape') {
      this.clearSelection();
    }
  }

  // Extrusion Logic
  extrudePolygon(polygon, height) {
    if (!this.validatePolygon(polygon)) return;

    const points = this.getPolygonPoints(polygon);
    if (points.length < 3) return;

    const shape = this.createShape(points);
    const geometry = this.createExtrudedGeometry(shape, height);

    this.updatePolygonGeometry(polygon, geometry, height);
    this.updatePolygonMaterial(polygon);
    this.updatePolygonOutline(polygon, geometry);

    this.emit('heightChanged', { height });
  }

  validatePolygon(polygon) {
    return polygon && polygon.userData?.markerPoints;
  }

  getPolygonPoints(polygon) {
    return polygon.userData.markerPoints.map(marker => ({
      x: marker.position.x,
      y: -marker.position.z // Invert Z coordinate to fix mirroring
    }));
  }

  createShape(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => shape.lineTo(point.x, point.y));
    shape.closePath();
    return shape;
  }

  createExtrudedGeometry(shape, height) {
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      steps: 1
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  updatePolygonGeometry(polygon, geometry, height) {
    if (polygon.geometry) {
      polygon.geometry.dispose();
    }
    polygon.geometry = geometry;
    polygon.userData.extrudeHeight = height;
    polygon.rotation.x = -Math.PI / 2;
  }

  updatePolygonMaterial(polygon) {
    this.disposeMaterials(polygon);
    polygon.material = [
      this.materials.get('extruded'),
      this.materials.get('extruded')
    ];
  }

  updatePolygonOutline(polygon, geometry) {
    this.cleanupExistingOutline(polygon);
    this.createNewOutline(polygon, geometry);
  }

  cleanupExistingOutline(polygon) {
    if (polygon.userData?.outline) {
      polygon.remove(polygon.userData.outline);
      polygon.userData.outline.geometry.dispose();
      polygon.userData.outline.material.dispose();
    }
  }

  createNewOutline(polygon, geometry) {
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const outline = new THREE.LineSegments(edgesGeometry, outlineMaterial);
    polygon.add(outline);
    polygon.userData.outline = outline;
  }

  // Material Management
  disposeMaterials(polygon) {
    if (Array.isArray(polygon.material)) {
      polygon.material.forEach(mat => mat?.dispose());
    } else if (polygon.material?.dispose) {
      polygon.material.dispose();
    }
  }

  // Tool State Management
  clearSelection() {
    if (this.selectedObject) {
      this.selectedObject = null;
      this.ui.hide();
      this.emit('selectionCleared');
    }
  }

  activate() {
    super.activate();
    this.clearSelection();
  }

  deactivate() {
    super.deactivate();
    this.clearSelection();
  }

  // Cleanup
  dispose() {
    super.dispose();
    this.clearSelection();
    if (this.selectedObject) {
      this.disposeMaterials(this.selectedObject);
    }
    this.materials.dispose();
    this.ui.dispose();
  }
}
