import { BaseTool } from './base';
import * as THREE from 'three';
import { MaterialManager } from './managers/material-manager';

const KEYBOARD_EVENTS = {
  DELETE: ['Delete', 'Backspace'],
  ESCAPE: 'Escape'
};

export class SelectTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);
    this.initializeProperties();
    this.setupEventListeners({
      click: this.onClick.bind(this),
      keydown: this.onKeyDown.bind(this)
    });
  }

  initializeProperties() {
    this.selection = {
      object: null,
      face: null,
      faceIndex: null
    };
    this.cache = {
      materials: new WeakMap(),
      geometries: new WeakMap()
    };
    this.materials = new MaterialManager();
  }

  getCursorStyle() {
    return 'pointer';
  }

  dispose() {
    super.dispose();
    this.clearSelection();
    this.materials.dispose();
    this.clearCache();
  }

  onClick(event) {
    if (!this.isActive) return;

    const intersects = this.getIntersectionPoint(event);
    const intersectedObject = this.findSelectableObject(intersects);

    if (!intersectedObject) {
      this.clearSelection();
      return;
    }

    this.handleObjectSelection(intersectedObject);
  }

  onKeyDown(event) {
    if (!this.isActive) return;

    if (KEYBOARD_EVENTS.DELETE.includes(event.key)) {
      this.deleteSelected();
    } else if (event.key === KEYBOARD_EVENTS.ESCAPE) {
      this.clearSelection();
    }
  }

  handleObjectSelection(intersection) {
    const { object } = intersection;

    if (object.geometry instanceof THREE.ExtrudeGeometry) {
      this.handleExtrudedGeometrySelection(intersection);
    } else {
      this.selectObject(object);
    }
  }

  selectObject(object) {
    this.clearSelection();
    this.cacheOriginalState(object);

    object.material = this.materials.get('selected');
    this.selection.object = object;
    this.emitSelectionEvent({ object });
  }

  handleExtrudedGeometrySelection(intersection) {
    const { object, faceIndex } = intersection;
    const geometry = object.geometry;
    const faces = this.getFacesFromGeometry(geometry);
    const selectedFace = faces[Math.floor(faceIndex / 2)];

    this.selectObjectWithFace(object, selectedFace, faceIndex);
    this.emitSelectionEvent({ object, faceIndex });
  }

  selectObjectWithFace(object, face, faceIndex) {
    this.clearSelection();
    this.cacheOriginalState(object);

    const geometry = this.createFaceHighlightGeometry(object);
    const materials = this.createFaceHighlightMaterials(object, faceIndex);

    object.geometry = geometry;
    object.material = materials;

    Object.assign(this.selection, { object, face, faceIndex });
  }

  createFaceHighlightGeometry(object) {
    const geometry = this.cache.geometries.get(object).clone();
    const numFaces = geometry.attributes.position.count / 6;

    geometry.clearGroups();
    for (let i = 0; i < numFaces; i++) {
      geometry.addGroup(i * 6, 6, i);
    }

    return geometry;
  }

  createFaceHighlightMaterials(object, faceIndex) {
    const originalMaterial = this.cache.materials.get(object);
    const baseMaterial = Array.isArray(originalMaterial)
      ? originalMaterial[0]
      : originalMaterial;

    const numFaces = this.getFaceCount(object);
    const materials = new Array(numFaces).fill(null).map(() =>
      this.cloneMaterial(baseMaterial)
    );

    const targetFaceIndex = Math.floor(faceIndex / 2);
    materials[targetFaceIndex] = this.materials.get('selected');

    return materials;
  }

  getFacesFromGeometry(geometry) {
    const position = geometry.attributes.position;
    const faces = [];

    for (let i = 0; i < position.count; i += 3) {
      faces.push({
        a: new THREE.Vector3().fromBufferAttribute(position, i),
        b: new THREE.Vector3().fromBufferAttribute(position, i + 1),
        c: new THREE.Vector3().fromBufferAttribute(position, i + 2)
      });
    }

    return faces;
  }

  getFaceCount(object) {
    return object.geometry.attributes.position.count / 6;
  }

  findSelectableObject(intersects) {
    return intersects.find(({ object }) =>
      object instanceof THREE.Mesh &&
      !object.userData.isVertex &&
      (object.geometry instanceof THREE.ShapeGeometry ||
        object.geometry instanceof THREE.ExtrudeGeometry)
    );
  }

  cloneMaterial(material) {
    if (Array.isArray(material)) {
      return material.map(m => m.clone());
    }
    return material && typeof material.clone === 'function'
      ? material.clone()
      : material;
  }

  cacheOriginalState(object) {
    if (!this.cache.materials.has(object)) {
      this.cache.materials.set(object, this.cloneMaterial(object.material));
    }
    if (!this.cache.geometries.has(object)) {
      this.cache.geometries.set(object, object.geometry.clone());
    }
  }

  clearCache() {
    this.cache.materials = new WeakMap();
    this.cache.geometries = new WeakMap();
  }

  clearSelection() {
    if (!this.selection.object) return;

    this.restoreOriginalState(this.selection.object);
    this.resetSelection();
    this.emit('selectionCleared');
  }

  restoreOriginalState(object) {
    const originalMaterial = this.cache.materials.get(object);
    const originalGeometry = this.cache.geometries.get(object);

    if (originalMaterial) {
      object.material = this.cloneMaterial(originalMaterial);
    }
    if (originalGeometry) {
      object.geometry = originalGeometry.clone();
    }
  }

  resetSelection() {
    this.selection = {
      object: null,
      face: null,
      faceIndex: null
    };
  }

  deleteSelected() {
    if (!this.selection.object) return;

    this.removeFromScene(this.selection.object);
    this.cleanupDeletedObject(this.selection.object);
    this.resetSelection();
    this.emit('objectDeleted');
  }

  removeFromScene(object) {
    this.removeMarkerPoints(object);
    this.scene.remove(object);
    this.disposeMaterials(object);
    this.disposeGeometry(object);
  }

  removeMarkerPoints(object) {
    if (!object.userData.markerPoints) return;

    object.userData.markerPoints.forEach(point => {
      this.scene.remove(point);
      point.geometry.dispose();
    });
  }

  disposeMaterials(object) {
    if (Array.isArray(object.material)) {
      object.material.forEach(mat => mat?.dispose());
    } else if (object.material?.dispose) {
      object.material.dispose();
    }
  }

  disposeGeometry(object) {
    if (object.geometry?.dispose) {
      object.geometry.dispose();
    }
  }

  cleanupDeletedObject(object) {
    this.cache.materials.delete(object);
    this.cache.geometries.delete(object);
  }

  emitSelectionEvent(data) {
    this.emit('objectSelected', data);
  }
}
