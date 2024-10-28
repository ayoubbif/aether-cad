import * as THREE from 'three';

export class GeometryFactory {
  /**
   * Creates a circular point geometry in the XZ plane.
   * @param {number} radius - The radius of the circle
   * @param {number} segments - Number of segments used to approximate the circle
   * @returns {THREE.BufferGeometry} A flat circular geometry rotated to lay in the XZ plane
   */
  static createPointGeometry(radius, segments) {
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.rotateX(-Math.PI / 2); // Rotate to lay flat in XZ plane
    return geometry;
  }

  /**
   * Creates a polygon geometry from an array of points in 3D space.
   * The polygon is created in the XZ plane.
   * @param {Array<{x: number, z: number}>} points - Array of points defining the polygon vertices
   * @returns {THREE.BufferGeometry} A flat polygon geometry
   */
  static createPolygonGeometry(points) {
    const shape = new THREE.Shape();
    const firstPoint = points[0];
    shape.moveTo(firstPoint.x, firstPoint.z);
    points.slice(1).forEach((point) => {
      shape.lineTo(point.x, point.z);
    });
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2); // Rotate to XZ plane
    return geometry;
  }

  /**
   * Creates an edges geometry from an existing geometry.
   * @param {THREE.BufferGeometry} geometry - The source geometry to extract edges from
   * @returns {THREE.BufferGeometry} A geometry representing the edges of the input geometry
   */
  static createEdgesGeometry(geometry) {
    return new THREE.EdgesGeometry(geometry);
  }

  /**
   * Creates an extruded geometry from a 2D shape with optional pitch transformation.
   * @param {Array<{x: number, y: number}>} points - Array of 2D points defining the base shape
   * @param {number} height - The height of the extrusion
   * @param {number} [pitch=0] - Optional pitch angle in degrees for the top face
   * @returns {THREE.BufferGeometry} An extruded geometry with optional pitched top face
   */
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

  /**
   * Applies a pitch transformation to the top face of an extruded geometry.
   * The pitch angle determines the slope of the top face relative to the base.
   *
   * @private
   * @param {THREE.BufferGeometry} geometry - The geometry to transform
   * @param {number} height - The height of the extrusion
   * @param {number} pitch - The pitch angle in degrees (clamped between -45° and 45°)
   */
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
        const heightOffset = height * tangent * relativePos;
        vertices[i + 2] = Math.max(0, height + heightOffset);
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }
}
