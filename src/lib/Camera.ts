import {Object3D} from './Object3D.js';
import {Matrix4} from './Matrix4.js';
import {Frustum} from './Frustrum.js';
import {Vector3} from './Vector3.js';

/**
 * Constructs a camera object. Can be extended to calculate projection matrices.
 */
export class Camera extends Object3D {
    /**
     * A projection matrix. Useful for projecting transforms.
     */
    readonly projectionMatrix = new Matrix4();
    /**
     * A view matrix. Useful for aligning transforms with the camera.
     */
    readonly viewMatrix = new Matrix4();
    /**
     * A projection-view matrix. Used internally for checking whether objects are in view.
     */
    readonly projectionViewMatrix = new Matrix4();
    /**
     * Frustum clipping planes. Used to calculate a frustum representation.
     */
    readonly frustum = new Frustum();

    viewport?: number[]; // [x, y, width, height]

    updateMatrix(): void {
        super.updateMatrix();
        if (this.matrixAutoUpdate) this.viewMatrix.copy(this.matrix).invert();
    }
}
