import {Controller} from '../classes/Controller';
import {Renderer} from '../lib/Renderer';
import {Matrix4} from './Matrix4';
import {Object3D} from './Object3D';

/**
 * Represents a scene in the game.
 */
export class Scene extends Object3D {
    leftHand!: Controller;
    rightHand!: Controller;

    constructor(renderer: Renderer) {
        super();
        this.name = 'scene';
        this.renderer = renderer;
    }

    updateInputSources(frame: XRFrame, refSpace: XRReferenceSpace) {
        for (const inputSource of frame.session.inputSources) {
            let gripPose = frame.getPose(inputSource.gripSpace!, refSpace)!;
            if (!gripPose) continue;
            const pos = gripPose.transform.position;
            const rot = gripPose.transform.orientation;
            let buttons = inputSource.gamepad?.buttons;
            if (inputSource.handedness == 'left') {
                this.leftHand.position.set(pos.x, pos.y, pos.z);
                this.leftHand.quaternion.set(rot.x, rot.y, rot.z, rot.w);
                this.leftHand.updateMatrix();
                this.leftHand.triggerPressed = buttons?.[0].pressed ?? false;
            } else {
                this.rightHand.position.set(pos.x, pos.y, pos.z);
                this.rightHand.quaternion.set(rot.x, rot.y, rot.z, rot.w);
                this.rightHand.updateMatrix();
                this.rightHand.triggerPressed = buttons?.[0].pressed ?? false;
            }
        }
    }
    prevTime: number;
    update(time: number): void {
        const deltaTime = (time - this.prevTime) / 1000;
        this.prevTime = time;
        this.children.forEach((c) => c.update(deltaTime));
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
