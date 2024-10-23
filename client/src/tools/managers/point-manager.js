import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';
import { GeometryFactory } from '../factories/geometry-factory';

export class PointManager {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.currentMarkers = [];
    this.completedMarkers = [];
  }

  createMarker(position) {
    const geometry = GeometryFactory.createPointGeometry(
      TOOL_CONFIG.POINT_RADIUS,
      TOOL_CONFIG.POINT_SEGMENTS
    );
    const point = new THREE.Mesh(geometry, this.materials.get('point'));
    point.position.copy(position).setY(TOOL_CONFIG.Y_OFFSET + 0.001);
    point.userData.isVertex = true;

    this.scene.add(point);
    this.currentMarkers.push(point);
    return point;
  }

  moveToCompleted() {
    // Store reference to the current batch of markers
    const currentBatch = [...this.currentMarkers];
    this.completedMarkers.push(...currentBatch);
    this.currentMarkers = [];
    return currentBatch;
  }

  removeCurrentMarkers() {
    this.currentMarkers.forEach(marker => {
      this.scene.remove(marker);
      marker.geometry.dispose();
    });
    this.currentMarkers = [];
  }

  removeAllMarkers() {
    this.removeCurrentMarkers();
    this.completedMarkers.forEach(marker => {
      this.scene.remove(marker);
      marker.geometry.dispose();
    });
    this.completedMarkers = [];
  }

  dispose() {
    this.removeAllMarkers();
  }
}
