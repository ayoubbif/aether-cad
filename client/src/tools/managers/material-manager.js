import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

/**
 * Manages the creation and disposal of THREE.js materials used across the application
 * Provides a centralized way to create and access consistent materials for different elements
 */
export class MaterialManager {
  /**
   * Initializes all materials with their specific properties
   * Each material is configured according to its intended use
   */
  constructor() {
    this.materials = {
      // Basic line material for standard lines
      line: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        linewidth: 10
      }),

      // Material for preview/temporary lines
      previewLine: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        linewidth: 10
      }),

      // Material for control points/vertices
      point: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.POINT
      }),

      // Material for highlighted/hovered points
      hoveredPoint: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.HOVERED
      }),

      // Material for filled polygons
      polygon: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.POLYGON,
        transparent: true,                    // Enable transparency
        opacity: TOOL_CONFIG.POLYGON_OPACITY,
        side: THREE.DoubleSide                // Render both sides of faces
      }),

      // Material for selected elements
      selected: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.SELECTED,
        transparent: true,
        opacity: TOOL_CONFIG.SELECTED_OPACITY,
        side: THREE.DoubleSide
      }),

      // Material for extruded/3D objects
      extruded: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.OBJECT,
        transparent: true,
        opacity: TOOL_CONFIG.OBJECT_OPACITY,
        side: THREE.DoubleSide
      })
    };
  }

  /**
   * Returns a clone of the requested material type
   * Cloning prevents sharing materials across objects, allowing individual modifications
   * @param {string} type - The type of material to retrieve
   * @returns {THREE.Material} A clone of the requested material
   */
  get(type) {
    return this.materials[type].clone();
  }

  /**
   * Properly disposes of all materials to free up GPU memory
   * Should be called when the manager is no longer needed
   */
  dispose() {
    Object.values(this.materials).forEach((material) => material.dispose());
  }
}
