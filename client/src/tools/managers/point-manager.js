import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';
import { GeometryFactory } from '../factories/geometry-factory';

/**
 * Manages the creation, storage, and cleanup of point markers in a Three.js scene.
 * Points are managed in two groups: current (being actively placed) and completed (finalized).
 */
export class PointManager {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.currentMarkers = [];
    this.completedMarkers = [];
  }

  /**
   * Creates a new point marker at the specified position.
   * The marker is added to the scene and stored in currentMarkers.
   *
   * @param {THREE.Vector3} position - The 3D position for the new marker
   * @returns {THREE.Mesh} The created point marker mesh
   */
  createMarker(position) {
    // Create circular geometry for the point marker
    const geometry = GeometryFactory.createPointGeometry(
      TOOL_CONFIG.POINT_RADIUS,
      TOOL_CONFIG.POINT_SEGMENTS
    );

    // Create mesh with point material and position it
    const point = new THREE.Mesh(geometry, this.materials.get('point'));
    point.position.copy(position).setY(TOOL_CONFIG.Y_OFFSET + 0.001); // Slight Y offset to prevent Z-fighting
    point.userData.isVertex = true;

    // Add to scene and tracking array
    this.scene.add(point);
    this.currentMarkers.push(point);
    return point;
  }

  /**
   * Moves current markers to the completed group.
   * This is typically called when finishing a drawing operation.
   *
   * @returns {Array<THREE.Mesh>} The batch of markers that were moved to completed
   */
  moveToCompleted() {
    // Store reference to the current batch of markers
    const currentBatch = [...this.currentMarkers];
    this.completedMarkers.push(...currentBatch);
    this.currentMarkers = [];
    return currentBatch;
  }

  /**
   * Removes all current markers from the scene and cleans up their resources.
   * Used when canceling a drawing operation or clearing current work.
   */
  removeCurrentMarkers() {
    this.currentMarkers.forEach((marker) => {
      this.scene.remove(marker);
      marker.geometry.dispose();  // Clean up geometry to prevent memory leaks
    });
    this.currentMarkers = [];
  }

  /**
   * Removes all markers (both current and completed) from the scene
   * and cleans up their resources.
   * Used when clearing all work or resetting the scene.
   */
  removeAllMarkers() {
    this.removeCurrentMarkers();
    this.completedMarkers.forEach((marker) => {
      this.scene.remove(marker);
      marker.geometry.dispose();  // Clean up geometry to prevent memory leaks
    });
    this.completedMarkers = [];
  }

  /**
   * Cleans up all resources managed by this PointManager.
   * Should be called when the PointManager is no longer needed.
   */
  dispose() {
    this.removeAllMarkers();
  }
}
