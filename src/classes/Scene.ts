import {Controller} from './Controller';
import {Renderer} from '../lib/Renderer';
import {Object3D, ObjectData} from '../lib/Object3D';
import {Matrix4} from '../lib/Matrix4';
import {Material} from '../lib/Material';

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
    override update(time: number): void {
        const deltaTime = (time - this.prevTime) / 1000;
        this.prevTime = time;
        this.children.forEach((c) => c.update(deltaTime));
    }

    override render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        // render controllers

        this.leftHand.render(projectionMatrix, transform);
        this.rightHand.render(projectionMatrix, transform);

        for (let index = 0; index < this.children.length; index++) {
            const element = this.children[index];
            element.render(projectionMatrix, transform);
        }
    }

    override render2(projectionMatrix: Float32Array, transform: XRRigidTransform): ObjectData {
        const ret: ObjectData = {m: [], c: []};

        for (let index = 0; index < this.children.length; index++) {
            const element = this.children[index];
            const data = element.render2(projectionMatrix, transform);
            if (data) {
                ret.m.push(...data.m);
                ret.c.push(...data.c);
            }
        }
        const matrix: Float32Array[] = [];
        const numInstances = ret.m.length;
        let matrixData = new Float32Array(numInstances * 16);

        for (let i = 0; i < numInstances; ++i) {
            let matrix = ret.m[i]; // Generate or get the matrix for instance i

            // Put this matrix data into the Float32Array
            matrixData.set(matrix, i * 16);
        }
        // const matrixData = new Float32Array(numInstances * 16);
        // for (let i = 0; i < numInstances; ++i) {
        //     const byteOffsetToMatrix = i * 16 * 4;
        //     const numFloatsForView = 16;
        //     matrix.push(
        //         new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView)
        //     );
        // }
        this.renderer!.draw2(ret.c, matrixData, numInstances, projectionMatrix, transform);
        return ret;
    }
}
