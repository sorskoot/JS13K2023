import {Material} from '../lib/Material';
import {Matrix4} from '../lib/Matrix4';
import {Mesh} from '../lib/Mesh';
import {Quaternion} from '../lib/Quaternion';
import {Renderer} from '../lib/Renderer';
import {Vector3} from '../lib/Vector3';

/**
 * Represents a node in a 3D scene graph.
 */
export class Node {
    translation: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    worldMatrix: Matrix4;

    constructor() {
        this.translation = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
        this.worldMatrix = Matrix4.Identity;
    }
    setRenderer(renderer: Renderer): void {}

    render(parentWorldMatrix: Matrix4): void {}
}

export class MeshNode extends Node {
    mesh: Mesh;
    material: Material;
    constructor(mesh: Mesh, material: Material) {
        super();

        this.mesh = mesh;
        this.material = material;
    }
}
