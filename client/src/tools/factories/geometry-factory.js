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

  static createEdgesGeometry(geometry) {
    return new THREE.EdgesGeometry(geometry);
  }

  static createExtrudedGeometry(points, height, pitch = 0) {
    const shape = new THREE.Shape(
      points.map((p) => new THREE.Vector2(p.x, p.y))
    );
    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: false
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    if (pitch !== 0) {
      this.applyPitchToGeometry(geometry, height, pitch);
    }
    return geometry;
  }

  static applyPitchToGeometry(geometry, height, pitch) {
    // Clamp pitch between -45 and 45 degrees
    pitch = Math.max(-45, Math.min(45, pitch));

    const vertices = geometry.attributes.position.array;

    // Find bounds
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }

    const width = maxX - minX;
    const centerX = (minX + maxX) / 2;
    const pitchRad = (pitch * Math.PI) / 180;
    const tangent = Math.tan(pitchRad);

    // Apply pitch transformation
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];

      // Only modify vertices at the top face
      if (Math.abs(z - height) < 0.001) {
        // Calculate position relative to center (ranges from -0.5 to 0.5)
        const relativePos = (x - centerX) / width;

        // Calculate new height using linear interpolation
        // For positive pitch: right side goes up, left side goes down
        // For negative pitch: left side goes up, right side goes down
        const heightOffset = height * tangent * relativePos;
        vertices[i + 2] = Math.max(0, height + heightOffset);
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }
}
