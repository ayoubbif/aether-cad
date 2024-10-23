import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

export class PreviewManager {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.point = this.createPreviewPoint();
    this.line = this.createPreviewLine();
  }

  createPreviewPoint() {
    const geometry = new THREE.CircleGeometry(
      TOOL_CONFIG.POINT_RADIUS,
      TOOL_CONFIG.POINT_SEGMENTS
    );
    geometry.rotateX(-Math.PI / 2);
    const point = new THREE.Mesh(geometry, this.materials.get('point'));
    point.material.transparent = true;
    point.visible = false;
    this.scene.add(point);
    return point;
  }

  createPreviewLine() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, this.materials.get('previewLine'));
    line.visible = false;
    this.scene.add(line);
    return line;
  }

  updatePosition(point, lastPoint = null) {
    this.point.position.copy(point).setY(TOOL_CONFIG.Y_OFFSET);
    this.point.visible = true;

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

  hide() {
    this.point.visible = false;
    this.line.visible = false;
  }

  dispose() {
    [this.point, this.line].forEach((object) => {
      if (object) {
        this.scene.remove(object);
        object.geometry.dispose();
        object.material.dispose();
      }
    });
  }
}
