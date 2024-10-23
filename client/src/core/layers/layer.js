export class Layer {
  constructor(mesh, type) {
    this.mesh = mesh;
    this.type = type;
    this.visible = true;
  }

  setVisibility(isVisible) {
    this.visible = isVisible;
    this.mesh.visible = isVisible;
  }

  getMesh() {
    return this.mesh;
  }
}
