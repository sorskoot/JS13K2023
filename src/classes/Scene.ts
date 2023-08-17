import {Renderer} from '../lib/Renderer';
import {Node} from './Node';

/**
 * Represents a scene in the game.
 */
export class Scene {
    renderer: Renderer;
    nodes: Node[];
    constructor(renderer) {
        this.renderer = renderer;
        this.nodes = [];
    }

    addNode(node: Node) {
        node.setRenderer(this.renderer);
        this.nodes.push(node);
    }

    render() {}
}
