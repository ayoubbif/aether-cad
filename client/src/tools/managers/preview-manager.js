import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

/**
 * Manages preview elements in a Three.js scene, showing temporary visual feedback
 * for points and lines before they are permanently placed.
 */
export class PreviewManager {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.point = this.createPreviewPoint();
    this.line = this.createPreviewLine();
  }

  /**
   * Creates a transparent preview point mesh.
   * The point is initially invisible and rotated to lay flat in the XZ plane.
   *
   * @returns {THREE.Mesh} The preview point mesh
   * @private
   */
  createPreviewPoint() {
    const geometry = new THREE.CircleGeometry(
      TOOL_CONFIG.POINT_RADIUS,
      TOOL_CONFIG.POINT_SEGMENTS
    );
    geometry.rotateX(-Math.PI / 2);  // Rotate to lay flat in XZ plane
    const point = new THREE.Mesh(geometry, this.materials.get('point'));
    point.material.transparent = true;  // Enable transparency for preview effect
    point.visible = false;             // Initially hidden
    this.scene.add(point);
    return point;
  }

  /**
   * Creates a preview line with empty geometry.
   * The line is initially invisible and will be updated with positions later.
   *
   * @returns {THREE.Line} The preview line mesh
   * @private
   */
  createPreviewLine() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6);  // Space for 2 points (2 * 3 coordinates)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, this.materials.get('previewLine'));
    line.visible = false;  // Initially hidden
    this.scene.add(line);
    return line;
  }

  /**
   * Updates the position of preview elements.
   * Shows a preview point at the current position and optionally a line
   * connecting it to the last point.
   *
   * @param {THREE.Vector3} point - Current position for preview point
   * @param {THREE.Vector3} [lastPoint=null] - Optional previous point to draw line from
   */
  updatePosition(point, lastPoint = null) {
    // Update and show preview point
    this.point.position.copy(point).setY(TOOL_CONFIG.Y_OFFSET);
    this.point.visible = true;

    // If there's a last point, update and show preview line
    if (lastPoint) {
      const positions = this.line.geometry.attributes.position.array;
      positions.set([
        lastPoint.x,
        lastPoint.y,
        lastPoint.z,
        point.x,
        point.y,
        point.z
      ]);
      this.line.geometry.attributes.position.needsUpdate = true;
      this.line.visible = true;
    }
  }

  /**
   * Hides all preview elements.
   * Called when preview feedback should be temporarily hidden.
   */
  hide() {
    this.point.visible = false;
    this.line.visible = false;
  }

  /**
   * Cleans up all resources managed by this PreviewManager.
   * Removes meshes from scene and disposes of geometries and materials.
   */
  dispose() {
    [this.point, this.line].forEach((object) => {
      if (object) {
        this.scene.remove(object);
        object.geometry.dispose();    // Clean up geometry
        object.material.dispose();    // Clean up material
      }
    });
  }
}
