import { BaseTool } from './base';
import * as THREE from 'three';
import { MaterialManager } from './managers/material-manager';

export class SelectTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);
    this.selectedObject = null;
    this.selectedFace = null;
    this.selectedFaceIndex = null;
    this.originalMaterials = new WeakMap();
    this.originalGeometries = new WeakMap();
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
    const intersectedObject = this.findSelectableObject(intersects);

    if (intersectedObject) {
      if (intersectedObject.object.geometry instanceof THREE.ExtrudeGeometry) {
        this.handleExtrudedGeometrySelection(intersectedObject);
      } else {
        this.selectObject(intersectedObject.object);
      }
    } else {
      this.clearSelection();
    }
  }

  findSelectableObject(intersects) {
    return intersects.find(intersect => {
      const object = intersect.object;
      return (
        object instanceof THREE.Mesh &&
        !object.userData.isVertex &&
        (object.geometry instanceof THREE.ShapeGeometry ||
         object.geometry instanceof THREE.ExtrudeGeometry)
      );
    });
  }

  handleExtrudedGeometrySelection(intersection) {
    const object = intersection.object;
    const faceIndex = intersection.faceIndex;

    // Get the face information
    const geometry = object.geometry;
    const faces = this.getFacesFromGeometry(geometry);
    const selectedFace = faces[Math.floor(faceIndex / 2)];

    this.selectObjectWithFace(object, selectedFace, faceIndex);

    // Emit selection event
    this.emit('objectSelected', {
      object,
      faceIndex
    });
  }

  getFacesFromGeometry(geometry) {
    const position = geometry.attributes.position;
    const faces = [];

    for (let i = 0; i < position.count; i += 3) {
      const face = {
        a: new THREE.Vector3().fromBufferAttribute(position, i),
        b: new THREE.Vector3().fromBufferAttribute(position, i + 1),
        c: new THREE.Vector3().fromBufferAttribute(position, i + 2)
      };
      faces.push(face);
    }

    return faces;
  }

  cloneMaterial(material) {
    if (Array.isArray(material)) {
      return material.map(m => m.clone());
    }
    if (material && typeof material.clone === 'function') {
      return material.clone();
    }
    return material;
  }

  selectObjectWithFace(object, face, faceIndex) {
    this.clearSelection();

    // Store original material and geometry
    if (!this.originalMaterials.has(object)) {
      this.originalMaterials.set(object, this.cloneMaterial(object.material));
    }
    if (!this.originalGeometries.has(object)) {
      this.originalGeometries.set(object, object.geometry.clone());
    }

    const geometry = this.originalGeometries.get(object).clone();
    const originalMaterial = this.originalMaterials.get(object);

    // Calculate the actual number of faces
    const numFaces = geometry.attributes.position.count / 6;

    // Create materials array with original material as base
    const baseMaterial = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial;
    const materials = Array(numFaces).fill().map(() =>
      this.cloneMaterial(baseMaterial)
    );

    // Set the selected face material
    const highlightMaterial = this.materials.get('selected');
    const targetFaceIndex = Math.floor(faceIndex / 2);
    materials[targetFaceIndex] = highlightMaterial;

    // Clear existing groups and create new ones
    geometry.clearGroups();
    for (let i = 0; i < numFaces; i++) {
      geometry.addGroup(i * 6, 6, i);
    }

    // Apply the new geometry and materials
    object.geometry = geometry;
    object.material = materials;

    this.selectedObject = object;
    this.selectedFace = face;
    this.selectedFaceIndex = faceIndex;
  }

  selectObject(object) {
    this.clearSelection();

    if (!this.originalMaterials.has(object)) {
      this.originalMaterials.set(object, this.cloneMaterial(object.material));
    }

    object.material = this.materials.get('selected');
    this.selectedObject = object;
    this.selectedFace = null;
    this.selectedFaceIndex = null;
    this.emit('objectSelected', { object });
  }

  clearSelection() {
    if (this.selectedObject) {
      const originalMaterial = this.originalMaterials.get(this.selectedObject);
      const originalGeometry = this.originalGeometries.get(this.selectedObject);

      if (originalMaterial) {
        this.selectedObject.material = this.cloneMaterial(originalMaterial);
      }
      if (originalGeometry) {
        this.selectedObject.geometry = originalGeometry.clone();
      }

      this.selectedObject = null;
      this.selectedFace = null;
      this.selectedFaceIndex = null;
      this.emit('selectionCleared');
    }
  }

  deleteSelected() {
    if (this.selectedObject) {
      this.removeFromSceneWithPoints(this.selectedObject);
      this.originalMaterials.delete(this.selectedObject);
      this.originalGeometries.delete(this.selectedObject);
      this.selectedObject = null;
      this.selectedFace = null;
      this.selectedFaceIndex = null;
      this.emit('objectDeleted');
    }
  }

  removeFromSceneWithPoints(object) {
    // Remove associated marker points
    if (object.userData.markerPoints) {
      object.userData.markerPoints.forEach(point => {
        this.scene.remove(point);
        point.geometry.dispose();
      });
    }

    // Remove the object
    this.scene.remove(object);

    // Dispose of materials
    if (Array.isArray(object.material)) {
      object.material.forEach(mat => mat?.dispose());
    } else if (object.material && typeof object.material.dispose === 'function') {
      object.material.dispose();
    }

    // Dispose of geometry
    if (object.geometry) {
      object.geometry.dispose();
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

    // Clear and dispose of stored materials and geometries
    this.originalMaterials = new WeakMap();
    this.originalGeometries = new WeakMap();
  }
}
