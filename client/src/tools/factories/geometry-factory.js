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
}
