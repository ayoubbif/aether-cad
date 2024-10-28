import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

/**
 * Manages the creation, updating, and disposal of line geometries in a THREE.js scene
 * Used for drawing continuous lines in 3D space, typically for tools or drawing features
 */
export class LineManager {
  /**
   * @param {THREE.Scene} scene - The THREE.js scene to add lines to
   * @param {Map} materials - Map of material names to THREE.Material instances
   */
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.currentLine = null;  // Holds reference to the current active line being drawn
  }

  /**
   * Creates a new line in the scene with initial buffer capacity
   * Uses BufferGeometry for better performance with dynamic line updates
   */
  create() {
    // Create buffer geometry with initial capacity for 1000 points (x,y,z for each)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 2);  // Initially set to draw first two points

    // Create line with specified material and add to scene
    this.currentLine = new THREE.Line(geometry, this.materials.get('line'));
    this.currentLine.position.y = TOOL_CONFIG.Y_OFFSET;  // Apply vertical offset from config
    this.currentLine.frustumCulled = false;  // Ensure line is always rendered
    this.scene.add(this.currentLine);
  }

  /**
   * Updates the line geometry with new points
   * @param {Array<THREE.Vector3>} points - Array of existing points
   * @param {THREE.Vector3} latestPoint - Most recent point to add to the line
   */
  update(points, latestPoint) {
    if (!this.currentLine) return;

    const positions = this.currentLine.geometry.attributes.position.array;
    const allPoints = [...points, latestPoint];

    // Update position buffer with all points
    allPoints.forEach((point, i) => {
      const index = i * 3;
      positions[index] = point.x;     // X coordinate
      positions[index + 1] = 0;       // Y is always 0 (flat line)
      positions[index + 2] = point.z; // Z coordinate
    });

    // Update draw range to show all points and mark buffer for update
    this.currentLine.geometry.setDrawRange(0, allPoints.length);
    this.currentLine.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Removes the current line from the scene and cleans up its geometry
   */
  clear() {
    if (this.currentLine) {
      this.scene.remove(this.currentLine);
      this.currentLine.geometry.dispose();  // Free GPU memory
      this.currentLine = null;
    }
  }

  /**
   * Clean up resources when manager is no longer needed
   */
  dispose() {
    this.clear();
  }
}
