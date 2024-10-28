import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';
import { PreviewManager } from './managers/preview-manager';
import { PointManager } from './managers/point-manager';
import { LineManager } from './managers/line-manager';
import { GeometryFactory } from './factories/geometry-factory';
import { TOOL_CONFIG } from '../constants/tool-config';

/**
 * DrawTool - Implements interactive polygon drawing functionality in 3D space
 *
 * This tool allows users to draw polygons by clicking points in 3D space. It handles:
 * - Point placement and visualization
 * - Live preview of lines while drawing
 * - Polygon completion through double-click or closing the shape
 * - Area calculation and event emission
 * - Multiple polygon management with z-index stacking
 *
 * The tool operates on a horizontal (XZ) plane with Y=0 by default
 */
export class DrawTool extends BaseTool {
  /**
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {THREE.Camera} camera - The camera for raycasting
   * @param {THREE.WebGLRenderer} renderer - The renderer
   */
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);

    this.initializeComponents(scene);
    this.initializeState();
    this.setupEventListeners({
      mousemove: this.onMouseMove.bind(this),
      click: this.onClick.bind(this),
      dblclick: this.onDoubleClick.bind(this),
      keydown: this.onKeyDown.bind(this)
    });
  }

  /**
   * Initializes all required managers and components
   * @param {THREE.Scene} scene - The Three.js scene
   */
  initializeComponents(scene) {
    // Create horizontal drawing plane at Y=0
    this.drawingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Initialize specialized managers for different aspects of drawing
    this.materials = new MaterialManager();
    this.preview = new PreviewManager(scene, this.materials);
    this.pointManager = new PointManager(scene, this.materials);
    this.lineManager = new LineManager(scene, this.materials);
  }

  /**
   * Initializes the tool's state for tracking drawn elements
   * Z-index ensures proper polygon stacking when overlapping
   */
  initializeState() {
    this.currentZIndex = 0;
    this.state = {
      currentPoints: [], // Points of the polygon being drawn
      polygons: []      // Completed polygons
    };
  }

  /**
   * @returns {string} Crosshair cursor for drawing operations
   */
  getCursorStyle() {
    return 'crosshair';
  }

  /**
   * Enhanced intersection detection that prioritizes vertex snapping
   * @param {MouseEvent} event - Mouse event
   * @returns {THREE.Vector3} Intersection point on the drawing plane
   */
  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);

    // Check for intersection with existing vertices for snapping
    const pointIntersect = intersects.find((i) => i.object.userData.isVertex);
    if (pointIntersect) {
      return pointIntersect.object.position.clone();
    }

    // Otherwise, intersect with the drawing plane
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.drawingPlane, intersectPoint);
    return intersectPoint.setY(0); // Ensure point stays on plane
  }

  /**
   * Handles live preview updates during mouse movement
   * @param {MouseEvent} event - Mouse move event
   */
  onMouseMove(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);
    const lastPoint =
      this.state.currentPoints[this.state.currentPoints.length - 1];

    // Update preview elements to show potential placement
    this.preview.updatePosition(point, lastPoint);
    this.lineManager.update(this.state.currentPoints, point);
  }

  /**
   * Handles point placement and polygon completion
   * @param {MouseEvent} event - Click event
   */
  onClick(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);

    // Check if clicking near start point to close polygon
    if (this.shouldCompletePolygon(point)) {
      this.completePolygon();
      return;
    }

    this.addPoint(point);
  }

  /**
   * Checks if a new point would close the polygon
   * @param {THREE.Vector3} point - Potential new point
   * @returns {boolean} True if point would close the polygon
   */
  shouldCompletePolygon(point) {
    if (this.state.currentPoints.length <= 2) return false;

    const startPoint = this.state.currentPoints[0];
    return point.distanceTo(startPoint) < TOOL_CONFIG.SNAP_DISTANCE;
  }

  /**
   * Adds a new point to the current polygon
   * @param {THREE.Vector3} point - Point to add
   */
  addPoint(point) {
    this.state.currentPoints.push(point);
    this.pointManager.createMarker(point);

    // Initialize line preview after first point
    if (this.state.currentPoints.length === 1) {
      this.lineManager.create();
    }
  }

  /**
   * Completes polygon on double click if enough points exist
   */
  onDoubleClick() {
    if (!this.isActive || this.state.currentPoints.length < 3) return;
    this.completePolygon();
  }

  /**
   * Handles escape key for canceling current drawing
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyDown(event) {
    if (
      event.key === 'Escape' &&
      this.isActive &&
      this.state.currentPoints.length > 0
    ) {
      this.cancelDrawing();
    }
  }

  /**
   * Creates final polygon mesh and adds it to scene
   * Handles cleanup and event emission
   */
  completePolygon() {
    if (this.state.currentPoints.length < 3) return;

    // Create and position the polygon mesh
    const geometry = GeometryFactory.createPolygonGeometry(
      this.state.currentPoints
    );
    const mesh = new THREE.Mesh(geometry, this.materials.get('polygon'));

    // Stack polygons with slight Y offset to prevent z-fighting
    this.currentZIndex += 0.001;
    mesh.position.setY(TOOL_CONFIG.Y_OFFSET + this.currentZIndex);

    // Store vertex references for later manipulation
    mesh.userData.markerPoints = [...this.pointManager.currentMarkers];

    this.scene.add(mesh);
    this.state.polygons.push(mesh);

    this.pointManager.moveToCompleted();
    this.emitCompletionEvent();
    this.resetCurrentDrawing();
  }

  /**
   * Emits completion event with area calculation
   */
  emitCompletionEvent() {
    const area = this.calculateArea();
    this.emit('polygonComplete', {
      area,
      points: [...this.state.currentPoints]
    });
    console.log(`Area: ${area.toFixed(2)} m²`);
  }

  /**
   * Calculates polygon area using the shoelace formula
   * @returns {number} Area in square units
   */
  calculateArea() {
    return (
      Math.abs(
        this.state.currentPoints.reduce((area, point, i) => {
          const nextPoint =
            this.state.currentPoints[(i + 1) % this.state.currentPoints.length];
          return area + (point.x * nextPoint.z - nextPoint.x * point.z);
        }, 0)
      ) / 2
    );
  }

  /**
   * Resets the current drawing state without removing completed polygons
   */
  resetCurrentDrawing() {
    this.lineManager.clear();
    this.state.currentPoints = [];
    this.preview.hide();
  }

  /**
   * Cancels the current drawing operation
   */
  cancelDrawing() {
    this.lineManager.clear();
    this.pointManager.removeCurrentMarkers();
    this.state.currentPoints = [];
    this.preview.hide();
  }

  /**
   * Removes all drawn polygons and resets tool state
   */
  resetAllDrawings() {
    this.cancelDrawing();
    this.pointManager.removeAllMarkers();

    // Clean up polygon meshes and geometries
    this.state.polygons.forEach((polygon) => {
      this.scene.remove(polygon);
      polygon.geometry.dispose();
    });
    this.state.polygons = [];
    this.currentZIndex = 0;
  }

  /**
   * Activates the tool and ensures clean state
   */
  activate() {
    super.activate();
    this.cancelDrawing();
  }

  /**
   * Deactivates the tool and cleans up current drawing
   */
  deactivate() {
    super.deactivate();
    this.cancelDrawing();
  }

  /**
   * Performs complete cleanup of tool resources
   */
  dispose() {
    super.dispose();
    this.resetAllDrawings();
    this.preview.dispose();
    this.materials.dispose();
    this.pointManager.dispose();
    this.lineManager.dispose();
  }
}
