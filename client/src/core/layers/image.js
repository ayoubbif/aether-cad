import * as THREE from 'three';
import { Layer } from './layer';
import { SCENE_CONFIG } from '../../constants/scene-config';

export class SatelliteLayer extends Layer {
  constructor(scene) {
    const geometry = new THREE.PlaneGeometry(
      SCENE_CONFIG.PLANE.SIZE,
      SCENE_CONFIG.PLANE.SIZE
    );
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01;

    super(mesh, 'image');
    scene.add(mesh);
  }

  updateTexture(texture) {
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
  }
}
