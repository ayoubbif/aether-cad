import * as THREE from 'three';
import { Layer } from './layer';
import { SCENE_CONFIG } from '../../constants/scene-config';

export class ImageLayer extends Layer {
  constructor(scene) {
    const geometry = new THREE.PlaneGeometry(
      SCENE_CONFIG.IMAGE.SIZE,
      SCENE_CONFIG.IMAGE.SIZE
    );
    const material = new THREE.MeshBasicMaterial({
      color: SCENE_CONFIG.IMAGE.DEFAULT_COLOR,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;

    super(mesh, 'image');
    scene.add(mesh);
  }

  updateTexture(texture) {
    if (texture) {
      this.mesh.material.map = texture;
      this.mesh.material.color.setHex(0xffffff); // Reset color to white when showing texture
    } else {
      this.mesh.material.map = null;
      this.mesh.material.color.setHex(SCENE_CONFIG.IMAGE.DEFAULT_COLOR);
    }
    this.mesh.material.needsUpdate = true;
  }
}
