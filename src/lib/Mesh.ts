import {VertexBuffer} from './VertexBuffer';

/**
 * Represents a 3D mesh.
 */
export class Mesh {
    vertexbuffer: VertexBuffer;

    /**
     * Creates a new instance of the Mesh class.
     * @param gl The WebGL2RenderingContext to use.
     */
    constructor(gl: WebGL2RenderingContext) {
        this.vertexbuffer = new VertexBuffer(gl);
        this.vertexbuffer.vertexLayout([3, 2, 3]);
    }

    /**
     * Frees resources used by the mesh.
     */
    free() {
        this.vertexbuffer.free();
    }

    /**
     * Loads vertex data into the mesh.
     * @param data The vertex data to load.
     */
    loadFromData(data) {
        this.vertexbuffer.vertexData(data);
    }
}
