import {Renderer} from '../lib/Renderer';
import {Matrix4} from './Matrix4';
import {Node} from './Node';

/**
 * Represents a scene in the game.
 */
export class Scene extends Node {
    leftHand!: Node;
    rightHand!: Node;

    nodes: Node[];
    constructor(renderer: Renderer) {
        super();
        this.renderer = renderer;
        this.nodes = [];
    }

    addNode(node: Node) {
        node.setRenderer(this.renderer!);
        this.nodes.push(node);
    }

    updateInputSources(frame: XRFrame, refSpace: XRReferenceSpace) {
        for (let inputSource of frame.session.inputSources) {
            let gripPose = frame.getPose(inputSource.gripSpace!, refSpace)!;
            const pos = gripPose.transform.position;
            const rot = gripPose.transform.orientation;

            if (inputSource.handedness == 'left') {
                this.leftHand.translation.set(pos.x, pos.y, pos.z);
                this.leftHand.rotation.set(rot.x, rot.y, rot.z, rot.w);
            } else {
                this.rightHand.translation.set(pos.x, pos.y, pos.z);
                this.rightHand.rotation.set(rot.x, rot.y, rot.z, rot.w);
            }
        }
    }

    render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        // render controllers

        this.leftHand.render(projectionMatrix, transform);
        this.rightHand.render(projectionMatrix, transform);

        for (let index = 0; index < this.nodes.length; index++) {
            const element = this.nodes[index];
            element.render(projectionMatrix, transform);
        }
    }
}
