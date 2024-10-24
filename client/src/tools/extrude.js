import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';
import { ExtrudeUI } from './ui/extrude-ui';
import { GeometryFactory } from './factories/geometry-factory';

export class ExtrudeTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);
    this.initializeProperties();
    this.setupEventListeners();
    this.initializeUI();
  }

  initializeProperties() {
    this.selectedObject = null;
    this.materials = new MaterialManager();
  }

  setupEventListeners() {
    super.setupEventListeners({
      mousedown: this.onMouseDown.bind(this),
      keydown: this.onKeyDown.bind(this)
    });
  }

  initializeUI() {
    this.ui = new ExtrudeUI(this.renderer.domElement.parentElement);
    this.ui.setHeightChangeHandler(this.handleHeightInputChange.bind(this));
    this.ui.setPitchChangeHandler(this.handlePitchInputChange.bind(this));
  }

  handleHeightInputChange(newHeight, pitch) {
    if (this.isValidHeight(newHeight)) {
      this.extrudePolygon(this.selectedObject, newHeight, pitch);
      this.emit('extrudeComplete', {
        object: this.selectedObject,
        height: newHeight,
        pitch: pitch
      });
    }
  }

  handlePitchInputChange(newPitch, height) {
    if (this.isValidPitch(newPitch)) {
      this.extrudePolygon(this.selectedObject, height, newPitch);
      this.emit('extrudeComplete', {
        object: this.selectedObject,
        height: height,
        pitch: newPitch
      });
    }
  }


  isValidHeight(height) {
    return !isNaN(height) && height >= 0.01;
  }

  isValidPitch(pitch) {
    return !isNaN(pitch) && pitch >= 0 && pitch <= 90;
  }

  getCursorStyle() {
    return 'cell';
  }

  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);
    const intersection = intersects.find(intersect => this.isValidIntersection(intersect));
    return intersection?.object;
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

  onMouseDown(event) {
    if (!this.isActive) return;

    const intersectedObject = this.getIntersectionPoint(event);
    if (intersectedObject) {
      this.handleObjectSelection(intersectedObject);
    }
  }

  onKeyDown(event) {
    if (!this.isActive) return;
    if (event.key === 'Escape') {
      this.clearSelection();
    }
  }

  handleObjectSelection(object) {
    if (!object?.userData) {
      console.error('Invalid object selected');
      return;
    }

    this.selectedObject = object;
    const currentHeight = object.userData.extrudeHeight || 0;
    const currentPitch = object.userData.pitch || 0;

    if (!object.userData.markerPoints) {
      console.error('No marker points found for polygon');
      return;
    }

    this.ui.show(currentHeight, currentPitch);
    this.emit('objectSelected', { object });
  }


  extrudePolygon(polygon, height, pitch = 0) {
    if (!this.validatePolygon(polygon)) return;

    const points = this.getPolygonPoints(polygon);
    if (points.length < 3) return;

    // Convert pitch from degrees to radians
    const pitchRad = (pitch * Math.PI) / 180;

    // Create extruded geometry with pitch
    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: false
    };

    const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)));
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Apply pitch transformation to the geometry
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      // Only modify vertices at the top face
      if (Math.abs(z - height) < 0.001) {
        // Calculate new height based on pitch and x position
        const xPos = vertices[i];
        const heightOffset = Math.tan(pitchRad) * xPos;
        vertices[i + 2] = height + heightOffset;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    this.updatePolygonGeometry(polygon, geometry, height, pitch);
    this.updatePolygonMaterial(polygon);
    this.updatePolygonOutline(polygon, geometry);

    this.emit('heightChanged', { height, pitch });
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

  updatePolygonGeometry(polygon, geometry, height, pitch) {
    if (polygon.geometry) {
      polygon.geometry.dispose();
    }
    polygon.geometry = geometry;
    polygon.userData.extrudeHeight = height;
    polygon.userData.pitch = pitch;
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
    const edgesGeometry = GeometryFactory.createEdgesGeometry(geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const outline = new THREE.LineSegments(edgesGeometry, outlineMaterial);
    polygon.add(outline);
    polygon.userData.outline = outline;
  }

  disposeMaterials(polygon) {
    if (Array.isArray(polygon.material)) {
      polygon.material.forEach(mat => mat?.dispose());
    } else if (polygon.material?.dispose) {
      polygon.material.dispose();
    }
  }

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
