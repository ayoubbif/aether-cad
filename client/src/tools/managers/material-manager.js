import * as THREE from 'three';
import { TOOL_CONFIG } from '../../constants/tool-config';

export class MaterialManager {
  constructor() {
    this.materials = {
      line: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        linewidth: 4
      }),
      previewLine: new THREE.LineBasicMaterial({
        color: TOOL_CONFIG.COLORS.LINE,
        opacity: 0.5,
        transparent: true,
        linewidth: 4
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
        opacity: 0.9,
        side: THREE.DoubleSide
      }),
      selected: new THREE.MeshBasicMaterial({
        color: TOOL_CONFIG.COLORS.SELECTED,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      })
    };
  }

  get(type) {
    return this.materials[type].clone();
  }

  dispose() {
    Object.values(this.materials).forEach(material => material.dispose());
  }
}
