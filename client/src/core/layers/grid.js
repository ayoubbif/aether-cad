import * as THREE from 'three';
import { Layer } from './layer';
import { SCENE_CONFIG } from '../../constants/scene-config';

export class GridLayer extends Layer {
  constructor(scene) {
    const gridHelper = new THREE.GridHelper(
      SCENE_CONFIG.GRID.SIZE,
      SCENE_CONFIG.GRID.DIVISIONS,
      SCENE_CONFIG.GRID.COLOR,
      SCENE_CONFIG.GRID.COLOR
    );
    super(gridHelper, 'grid');
    scene.add(gridHelper);
  }
}
