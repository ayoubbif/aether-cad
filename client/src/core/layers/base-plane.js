import * as THREE from 'three';
import { Layer } from './layer';
import { SCENE_CONFIG } from '../../constants/scene-config';

export class BasePlaneLayer extends Layer {
  constructor(scene) {
    const geometry = new THREE.PlaneGeometry(
      SCENE_CONFIG.PLANE.SIZE,
      SCENE_CONFIG.PLANE.SIZE
    );
    const material = new THREE.MeshBasicMaterial({
      color: SCENE_CONFIG.PLANE.COLOR,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.01;

    super(mesh, 'basePlane');
    scene.add(mesh);
  }
}
