import { BaseTool } from './base';
import * as THREE from 'three';
import { MaterialManager } from './managers/material-manager';

export class SelectTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);

    this.selectedObject = null;
    this.originalMaterials = new WeakMap();
    this.materials = new MaterialManager();

    this.setupEventListeners({
      click: this.onClick,
      keydown: this.onKeyDown
    });
  }

  getCursorStyle() {
    return 'pointer';
  }

  onClick(event) {
    if (!this.isActive) return;

    const intersects = this.getIntersectionPoint(event);
    const drawnPolygon = this.findDrawnPolygon(intersects);

    if (drawnPolygon) {
      this.selectObject(drawnPolygon);
    } else {
      this.clearSelection();
    }
  }

  findDrawnPolygon(intersects) {
    return intersects.find((intersect) => {
      const object = intersect.object;
      return (
        object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshBasicMaterial &&
        !object.userData.isVertex &&
        object.geometry instanceof THREE.ShapeGeometry
      );
    })?.object;
  }

  selectObject(object) {
    this.clearSelection();
    this.originalMaterials.set(object, object.material);
    object.material = this.materials.get('selected');
    this.selectedObject = object;
    this.emit('objectSelected', { object });
  }

  clearSelection() {
    if (this.selectedObject) {
      const originalMaterial = this.originalMaterials.get(this.selectedObject);
      if (originalMaterial) {
        this.selectedObject.material = originalMaterial;
        this.originalMaterials.delete(this.selectedObject);
      }
      this.selectedObject = null;
      this.emit('selectionCleared');
    }
  }

  deleteSelected() {
    if (this.selectedObject) {
      this.removeFromSceneWithPoints(this.selectedObject);
      this.selectedObject = null;
      this.emit('objectDeleted');
    }
  }

  removeFromSceneWithPoints(object) {
    // Remove associated marker points
    if (object.userData.markerPoints) {
      object.userData.markerPoints.forEach((point) => {
        this.scene.remove(point);
        point.geometry.dispose();
      });
    }

    // Remove the polygon
    this.scene.remove(object);
    object.geometry.dispose();
    if (object.material && !this.originalMaterials.has(object)) {
      object.material.dispose();
    }
  }

  onKeyDown(event) {
    if (!this.isActive) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.deleteSelected();
    } else if (event.key === 'Escape') {
      this.clearSelection();
    }
  }

  dispose() {
    super.dispose();
    this.clearSelection();
    this.materials.dispose();
  }
}
