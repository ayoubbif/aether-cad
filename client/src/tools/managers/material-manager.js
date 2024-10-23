import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

export class MaterialManager {
  constructor() {
    this.materials = {
      line: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        linewidth: 10
      }),
      previewLine: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        linewidth: 10
      }),
      point: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.POINT
      }),
      hoveredPoint: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.HOVERED
      }),
      polygon: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.POLYGON,
        transparent: true,
        opacity: TOOL_CONFIG.POLYGON_OPACITY,
        side: THREE.DoubleSide
      }),
      selected: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.SELECTED,
        transparent: true,
        opacity: TOOL_CONFIG.SELECTED_OPACITY,
        side: THREE.DoubleSide
      })
    };
  }

  get(type) {
    return this.materials[type].clone();
  }

  dispose() {
    Object.values(this.materials).forEach((material) => material.dispose());
  }
}
