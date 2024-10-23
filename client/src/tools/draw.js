import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';
import { PreviewManager } from './managers/preview-manager';
import { PointManager } from './managers/point-manager';
import { LineManager } from './managers/line-manager';
import { GeometryFactory } from './factories/geometry-factory';
import { TOOL_CONFIG } from '../constants/tool-config';

export class DrawTool extends BaseTool {
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

  initializeComponents(scene) {
    this.drawingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.materials = new MaterialManager();
    this.preview = new PreviewManager(scene, this.materials);
    this.pointManager = new PointManager(scene, this.materials);
    this.lineManager = new LineManager(scene, this.materials);
  }

  initializeState() {
    this.currentZIndex = 0;
    this.state = {
      currentPoints: [],
      polygons: []
    };
  }

  getCursorStyle() {
    return 'crosshair';
  }

  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);

    const pointIntersect = intersects.find(i => i.object.userData.isVertex);
    if (pointIntersect) {
      return pointIntersect.object.position.clone();
    }

    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.drawingPlane, intersectPoint);
    return intersectPoint.setY(0);
  }

  onMouseMove(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);
    const lastPoint = this.state.currentPoints[this.state.currentPoints.length - 1];

    this.preview.updatePosition(point, lastPoint);
    this.lineManager.update(this.state.currentPoints, point);
  }

  onClick(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);

    if (this.shouldCompletePolygon(point)) {
      this.completePolygon();
      return;
    }

    this.addPoint(point);
  }

  shouldCompletePolygon(point) {
    if (this.state.currentPoints.length <= 2) return false;

    const startPoint = this.state.currentPoints[0];
    return point.distanceTo(startPoint) < TOOL_CONFIG.SNAP_DISTANCE;
  }

  addPoint(point) {
    this.state.currentPoints.push(point);
    this.pointManager.createMarker(point);

    if (this.state.currentPoints.length === 1) {
      this.lineManager.create();
    }
  }

  onDoubleClick() {
    if (!this.isActive || this.state.currentPoints.length < 3) return;
    this.completePolygon();
  }

  onKeyDown(event) {
    if (event.key === 'Escape' && this.isActive && this.state.currentPoints.length > 0) {
      this.cancelDrawing();
    }
  }

  completePolygon() {
    if (this.state.currentPoints.length < 3) return;

    const geometry = GeometryFactory.createPolygonGeometry(this.state.currentPoints);
    const mesh = new THREE.Mesh(geometry, this.materials.get('polygon'));

    this.currentZIndex += 0.001;
    mesh.position.setY(TOOL_CONFIG.Y_OFFSET + this.currentZIndex);

    // Store references to the marker points
    mesh.userData.markerPoints = [...this.pointManager.currentMarkers];

    this.scene.add(mesh);
    this.state.polygons.push(mesh);

    this.pointManager.moveToCompleted();
    this.emitCompletionEvent();
    this.resetCurrentDrawing();
  }

  emitCompletionEvent() {
    const area = this.calculateArea();
    this.emit('polygonComplete', {
      area,
      points: [...this.state.currentPoints]
    });
    console.log(`Area: ${area.toFixed(2)} m²`);
  }

  calculateArea() {
    return Math.abs(this.state.currentPoints.reduce((area, point, i) => {
      const nextPoint = this.state.currentPoints[(i + 1) % this.state.currentPoints.length];
      return area + (point.x * nextPoint.z - nextPoint.x * point.z);
    }, 0)) / 2;
  }

  resetCurrentDrawing() {
    this.lineManager.clear();
    this.state.currentPoints = [];
    this.preview.hide();
  }

  cancelDrawing() {
    this.lineManager.clear();
    this.pointManager.removeCurrentMarkers();
    this.state.currentPoints = [];
    this.preview.hide();
  }

  resetAllDrawings() {
    this.cancelDrawing();
    this.pointManager.removeAllMarkers();

    this.state.polygons.forEach(polygon => {
      this.scene.remove(polygon);
      polygon.geometry.dispose();
    });
    this.state.polygons = [];
    this.currentZIndex = 0;
  }

  activate() {
    super.activate();
    this.cancelDrawing();
  }

  deactivate() {
    super.deactivate();
    this.cancelDrawing();
  }

  dispose() {
    super.dispose();
    this.resetAllDrawings();
    this.preview.dispose();
    this.materials.dispose();
    this.pointManager.dispose();
    this.lineManager.dispose();
  }
}
