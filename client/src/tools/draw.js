import * as THREE from 'three';
import { BaseTool } from './base';
import { MaterialManager } from './managers/material-manager';
import { PreviewManager } from './managers/preview-manager';
import { TOOL_CONFIG } from '../constants/tool-config';

export class DrawTool extends BaseTool {
  constructor(scene, camera, renderer) {
    super(scene, camera, renderer);

    this.drawingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.materials = new MaterialManager();
    this.preview = new PreviewManager(scene, this.materials);

    this.state = {
      currentPoints: [],
      currentLine: null,
      polygons: [],
      pointMarkers: []
    };

    this.setupEventListeners({
      mousemove: this.onMouseMove,
      click: this.onClick,
      dblclick: this.onDoubleClick,
      keydown: this.onKeyDown
    });
  }

  getCursorStyle() {
    return 'crosshair';
  }

  getIntersectionPoint(event) {
    const intersects = super.getIntersectionPoint(event);

    // Check for point snapping
    const pointIntersect = intersects.find(i => i.object.userData.isVertex);
    if (pointIntersect) {
      return pointIntersect.object.position.clone();
    }

    // Intersect with drawing plane
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.drawingPlane, intersectPoint);
    return intersectPoint.setY(0);
  }

  onMouseMove(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);
    const lastPoint = this.state.currentPoints[this.state.currentPoints.length - 1];

    this.preview.updatePosition(point, lastPoint);

    if (this.state.currentLine) {
      this.updateCurrentLine(point);
    }
  }

  onClick(event) {
    if (!this.isActive) return;

    const point = this.getIntersectionPoint(event);

    // Check for polygon completion
    if (this.state.currentPoints.length > 2) {
      const startPoint = this.state.currentPoints[0];
      if (point.distanceTo(startPoint) < TOOL_CONFIG.SNAP_DISTANCE) {
        this.completePolygon();
        return;
      }
    }

    this.state.currentPoints.push(point);
    this.createPointMarker(point);

    if (this.state.currentPoints.length === 1) {
      this.createCurrentLine();
    }
  }

  onDoubleClick() {
    if (!this.isActive || this.state.currentPoints.length < 3) return;
    this.completePolygon();
  }

  onKeyDown(event) {
    if (event.key === 'Escape' && this.isActive && this.state.currentPoints.length > 0) {
      this.resetCurrentDrawing();
    }
  }

  createPointMarker(position) {
    const geometry = new THREE.CircleGeometry(TOOL_CONFIG.POINT_RADIUS, TOOL_CONFIG.POINT_SEGMENTS);
    geometry.rotateX(-Math.PI / 2);
    const point = new THREE.Mesh(geometry, this.materials.get('point'));
    point.position.copy(position).setY(TOOL_CONFIG.Y_OFFSET);
    point.userData.isVertex = true;
    this.scene.add(point);
    this.state.pointMarkers.push(point);
    return point;
  }

  createCurrentLine() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 2);

    this.state.currentLine = new THREE.Line(geometry, this.materials.get('line'));
    this.scene.add(this.state.currentLine);
  }

  updateCurrentLine(latestPoint) {
    const line = this.state.currentLine;
    if (!line) return;

    const positions = line.geometry.attributes.position.array;
    const points = [...this.state.currentPoints, latestPoint];

    points.forEach((point, i) => {
      const index = i * 3;
      positions[index] = point.x;
      positions[index + 1] = point.y;
      positions[index + 2] = point.z;
    });

    line.geometry.setDrawRange(0, points.length);
    line.geometry.attributes.position.needsUpdate = true;
  }

  completePolygon() {
    if (this.state.currentPoints.length < 3) return;

    const shape = new THREE.Shape();
    const firstPoint = this.state.currentPoints[0];

    shape.moveTo(firstPoint.x, firstPoint.z);
    this.state.currentPoints.slice(1).forEach(point => {
      shape.lineTo(point.x, point.z);
    });
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, this.materials.get('polygon'));
    mesh.position.setY(TOOL_CONFIG.Y_OFFSET);

    this.scene.add(mesh);
    this.state.polygons.push(mesh);

    const area = this.calculateArea();
    this.emit('polygonComplete', { area, points: [...this.state.currentPoints] });

    this.resetCurrentDrawing();
    this.preview.hide();
  }

  calculateArea() {
    return Math.abs(this.state.currentPoints.reduce((area, point, i) => {
      const nextPoint = this.state.currentPoints[(i + 1) % this.state.currentPoints.length];
      return area + (point.x * nextPoint.z - nextPoint.x * point.z);
    }, 0)) / 2;
  }

  clearCurrentLine() {
    if (this.state.currentLine) {
      this.removeFromScene(this.state.currentLine);
      this.state.currentLine = null;
    }
  }

  removeCurrentMarkers() {
    this.state.pointMarkers.forEach(marker => {
      this.removeFromScene(marker);
    });
    this.state.pointMarkers = [];
  }

  resetCurrentDrawing() {
    this.clearCurrentLine();
    this.removeCurrentMarkers();
    this.state.currentPoints = [];
  }

  activate() {
    super.activate();
    this.resetCurrentDrawing();
  }

  deactivate() {
    super.deactivate();
    this.resetCurrentDrawing();
    this.preview.hide();
  }

  dispose() {
    super.dispose();

    // Dispose of all geometries and materials
    this.state.polygons.forEach(polygon => this.removeFromScene(polygon));
    this.removeCurrentMarkers();
    this.clearCurrentLine();
    this.preview.dispose();
    this.materials.dispose();
  }
}
