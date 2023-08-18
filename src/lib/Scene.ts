import {Renderer} from '../lib/Renderer';
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
        }
    }

    render(projectionMatrix: Float32Array, transform: XRRigidTransform) {
        // render controllers

        for (let index = 0; index < this.nodes.length; index++) {
            const element = this.nodes[index];
            element.render(projectionMatrix, transform);
        }
    }
}
