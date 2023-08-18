import {Matrix4} from '../lib/Matrix4';
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

    protected renderer?: Renderer;

    constructor() {
        this.translation = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
        this.worldMatrix = Matrix4.Identity;
    }

    setRenderer(renderer: Renderer): void {
        this.renderer = renderer;
    }

    render(projectionMatrix: Float32Array, transform: XRRigidTransform) {}
    //render(parentWorldMatrix: Matrix4): void {}
}
