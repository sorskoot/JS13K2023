import {Material} from './Material';
import {Matrix4} from './Matrix4';
import {Mesh} from './Mesh';
import {Object3D} from './Object3D';
import {Quaternion} from './Quaternion';
import {Vector3} from './Vector3';

export class MeshNode extends Object3D {
    mesh: Mesh;
    material: Material;
    constructor(mesh: Mesh, material: Material) {
        super();
        this.name = 'mesh';
        this.mesh = mesh;
        this.material = material;
    }

    override render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        if (!this.renderer || !this.active) return;

        // set translation, rotation, and scale
        // let transformMatrix = Matrix4.Identity;
        // transformMatrix.compose(this.translation, this.rotation, this.scale);

        // Set view matrix from the inverse of camera transformation.
        let inv = Matrix4.from(transform.inverse.matrix) as Matrix4;

        // Compute model-view matrix by multiplying inverse camera transform with object transform
        //let modelViewMatrix = inv.multiply(this.matrix);
        // this.matrix.compose(this.position, this.quaternion, this.scale);
        this.material.setModel(this.absoluteTransform);
        this.material.setView(inv);

        // Set uniforms
        this.material.setProjection(projectionMatrix);
        this.renderer.draw(this.mesh, this.material);

        this.children?.forEach((child) => {
            //child.worldMatrix = transformMatrix;

            child.render(projectionMatrix, transform);
        });
    }
}
