import {Material} from '../lib/Material';
import {Matrix4} from '../lib/Matrix4';
import {Mesh} from '../lib/Mesh';
import {Quaternion} from '../lib/Quaternion';
import {Vector3} from '../lib/Vector3';

/**
 * Represents a node in a 3D scene graph.
 */
export class Node {
    private translation: Vector3;
    private rotation: Quaternion;
    private scale: Vector3;
    private worldMatrix: Matrix4;

    mesh: Mesh;
    material: Material;

    constructor(mesh: Mesh, material: Material) {
        this.translation = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
        this.worldMatrix = Matrix4.Identity;

        this.mesh = mesh;
        this.material = material;
    }
}
