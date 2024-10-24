import * as THREE from 'three';

export class GeometryFactory {
  static createPointGeometry(radius, segments) {
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }

  static createPolygonGeometry(points) {
    const shape = new THREE.Shape();
    const firstPoint = points[0];
    shape.moveTo(firstPoint.x, firstPoint.z);
    points.slice(1).forEach((point) => {
      shape.lineTo(point.x, point.z);
    });
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }

  static createExtrudedGeometry(points, height) {
    const shape = this.createShape(points);
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      steps: 1
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  static createShape(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => shape.lineTo(point.x, point.y));
    shape.closePath();
    return shape;
  }

  static createEdgesGeometry(geometry) {
    return new THREE.EdgesGeometry(geometry);
  }
}
