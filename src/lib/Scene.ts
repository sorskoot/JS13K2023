import {Renderer} from '../lib/Renderer';
import {Matrix4} from './Matrix4';
import {Object3D} from './Object3D';

/**
 * Represents a scene in the game.
 */
export class Scene extends Object3D {
    leftHand!: Object3D;
    rightHand!: Object3D;

    constructor(renderer: Renderer) {
        super();
        this.name = 'scene';
        this.renderer = renderer;
    }

    updateInputSources(frame: XRFrame, refSpace: XRReferenceSpace) {
        for (let inputSource of frame.session.inputSources) {
            let gripPose = frame.getPose(inputSource.gripSpace!, refSpace)!;
            const pos = gripPose.transform.position;
            const rot = gripPose.transform.orientation;

            if (inputSource.handedness == 'left') {
                this.leftHand.position.set(pos.x, pos.y, pos.z);
                this.leftHand.quaternion.set(rot.x, rot.y, rot.z, rot.w);
                this.leftHand.updateMatrix();
            } else {
                this.rightHand.position.set(pos.x, pos.y, pos.z);
                this.rightHand.quaternion.set(rot.x, rot.y, rot.z, rot.w);
                this.rightHand.updateMatrix();
            }
        }
    }

    render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        // render controllers

        this.leftHand.render(projectionMatrix, transform);
        this.rightHand.render(projectionMatrix, transform);

        for (let index = 0; index < this.children.length; index++) {
            const element = this.children[index];
            element.render(projectionMatrix, transform);
        }
    }
}
