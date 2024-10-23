import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

export class LineManager {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.currentLine = null;
  }

  create() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 2);

    this.currentLine = new THREE.Line(geometry, this.materials.get('line'));
    this.currentLine.position.y = TOOL_CONFIG.Y_OFFSET + 0.002;
    this.scene.add(this.currentLine);
  }

  update(points, latestPoint) {
    if (!this.currentLine) return;

    const positions = this.currentLine.geometry.attributes.position.array;
    const allPoints = [...points, latestPoint];

    allPoints.forEach((point, i) => {
      const index = i * 3;
      positions[index] = point.x;
      positions[index + 1] = 0;
      positions[index + 2] = point.z;
    });

    this.currentLine.geometry.setDrawRange(0, allPoints.length);
    this.currentLine.geometry.attributes.position.needsUpdate = true;
  }

  clear() {
    if (this.currentLine) {
      this.scene.remove(this.currentLine);
      this.currentLine.geometry.dispose();
      this.currentLine = null;
    }
  }

  dispose() {
    this.clear();
  }
}
