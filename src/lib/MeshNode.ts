import {Material} from './Material';
import {Matrix4} from './Matrix4';
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

        // set translation, rotation, and scale
        let transformMatrix = Matrix4.Identity;
        transformMatrix.compose(this.translation, this.rotation, this.scale);

        // Set view matrix from the inverse of camera transformation.
        let inv = Matrix4.from(transform.inverse.matrix) as Matrix4;

        // Compute model-view matrix by multiplying inverse camera transform with object transform
        let modelViewMatrix = inv.multiply(transformMatrix);
        this.material.setView(modelViewMatrix);

        // Set uniforms
        this.material.setProjection(projectionMatrix);
        this.renderer.draw(this.mesh, this.material);
    }
}
