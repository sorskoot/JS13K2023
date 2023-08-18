import {Material} from './Material';
import {Mesh} from './Mesh';
import {Node} from './Node';

export class MeshNode extends Node {
    mesh: Mesh;
    material: Material;
    constructor(mesh: Mesh, material: Material) {
        super();

        this.mesh = mesh;
        this.material = material;
    }

    override render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        if (!this.renderer) return;
        this.material.setProjection(projectionMatrix);
        this.material.setView(transform.inverse.matrix);
        this.renderer.draw(this.mesh, this.material);
    }
}
