import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';

export class ExtrudeTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);

    this.selectedObject = null;
    this.materials = new MaterialManager();

    this.setupEventListeners({
      mousedown: this.onMouseDown.bind(this),
      keydown: this.onKeyDown.bind(this)
    });

    // Create height input element
    this.createHeightInput();
  }

  createHeightInput() {
    // Create container for the height input
    this.heightInputContainer = document.createElement('div');
    this.heightInputContainer.style.position = 'absolute';
    this.heightInputContainer.style.left = '20px';
    this.heightInputContainer.style.top = '20px';
    this.heightInputContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    this.heightInputContainer.style.padding = '10px';
    this.heightInputContainer.style.borderRadius = '5px';
    this.heightInputContainer.style.display = 'none';

    // Create label
    const label = document.createElement('label');
    label.textContent = 'Height: ';
    label.style.color = 'white';
    label.style.marginRight = '5px';

    // Create input
    this.heightInput = document.createElement('input');
    this.heightInput.type = 'number';
    this.heightInput.step = '0.1';
    this.heightInput.min = '0.1';
    this.heightInput.style.width = '60px';

    // Add event listener for input changes
    this.heightInput.addEventListener('change', (e) => {
      const newHeight = parseFloat(e.target.value);
      if (!isNaN(newHeight) && newHeight >= 0.1) {
        this.extrudePolygon(this.selectedObject, newHeight);
        this.emit('extrudeComplete', {
          object: this.selectedObject,
          height: newHeight
        });
      }
    });

    // Append elements
    this.heightInputContainer.appendChild(label);
    this.heightInputContainer.appendChild(this.heightInput);

    // Add to renderer's container
    this.renderer.domElement.parentElement.appendChild(this.heightInputContainer);
  }

  showHeightInput(height) {
    this.heightInput.value = height.toFixed(1);
    this.heightInputContainer.style.display = 'block';
  }

  hideHeightInput() {
    this.heightInputContainer.style.display = 'none';
  }

  getCursorStyle() {
    return 'pointer';
  }

  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);
    return intersects.find((intersect) =>
      intersect.object instanceof THREE.Mesh &&
      !intersect.object.userData.isVertex &&
      (intersect.object.geometry instanceof THREE.ShapeGeometry ||
       intersect.object.geometry instanceof THREE.ExtrudeGeometry)
    )?.object;
  }

  onMouseDown(event) {
    if (!this.isActive) return;

    const intersectedObject = this.getIntersectionPoint(event);
    if (intersectedObject) {
      this.selectedObject = intersectedObject;

      // Get the current height if already extruded
      const currentHeight = this.selectedObject.userData.extrudeHeight || 0;

      // Store marker points if not already stored
      if (!this.selectedObject.userData.markerPoints) {
        console.error('No marker points found for polygon');
        return;
      }

      this.showHeightInput(currentHeight);
      this.emit('objectSelected', { object: this.selectedObject });
    }
  }

  onKeyDown(event) {
    if (!this.isActive) return;

    if (event.key === 'Escape') {
      this.clearSelection();
    }
  }

  extrudePolygon(polygon, height) {
    if (!polygon || !polygon.userData.markerPoints) return;

    // Get points from marker points and correct their orientation
    const points = polygon.userData.markerPoints.map(marker => ({
      x: marker.position.x,
      y: -marker.position.z  // Invert Z coordinate to fix mirroring
    }));

    if (points.length < 3) return;

    // Create shape from points
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();

    // Create extrusion settings with correct depth direction
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      steps: 1
    };

    // Create new extruded geometry
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Update the mesh
    polygon.geometry.dispose();
    polygon.geometry = geometry;

    // Store the height in userData
    polygon.userData.extrudeHeight = height;

    // Apply correct orientation
    polygon.rotation.x = -Math.PI / 2;  // Rotate to correct plane

    // Update material
    if (Array.isArray(polygon.material)) {
      polygon.material.forEach(mat => mat.dispose());
    } else {
      polygon.material.dispose();
    }

    // Create materials array for different faces
    polygon.material = [
      this.materials.get('extruded'), // Top and bottom faces
      this.materials.get('extruded')  // Side faces
    ];

    this.emit('heightChanged', { height });
  }

  clearSelection() {
    if (this.selectedObject) {
      this.selectedObject = null;
      this.hideHeightInput();
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
      if (Array.isArray(this.selectedObject.material)) {
        this.selectedObject.material.forEach(mat => mat.dispose());
      } else {
        this.selectedObject.material.dispose();
      }
    }
    this.materials.dispose();

    // Remove height input
    if (this.heightInputContainer && this.heightInputContainer.parentElement) {
      this.heightInputContainer.parentElement.removeChild(this.heightInputContainer);
    }
  }
}
