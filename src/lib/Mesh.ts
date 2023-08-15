import {Vec3} from './Types';
import {VertexBuffer} from './VertexBuffer';

export class Mesh {
    vertexbuffer: VertexBuffer;
    data: number[];
    constructor(gl: WebGL2RenderingContext) {
        this.vertexbuffer = new VertexBuffer(gl);
        this.vertexbuffer.vertexLayout([3, 2, 3]);
    }
    free() {
        this.vertexbuffer.free();
    }

    private setVertexData(data: number[]) {
        this.vertexbuffer.vertexData(data);
    }

    loadFromData(data: number[]) {
        this.data = data;
        this.setVertexData(this.data);
    }

    scale(scaleFactor: Vec3) {
        for (let i = 0; i < this.data.length; i += 8) {
            // Scale x vertex
            this.data[i] *= scaleFactor.x;

            // Scale y vertex
            this.data[i + 1] *= scaleFactor.y;

            // Scale z vertex
            this.data[i + 2] *= scaleFactor.z;
        }
        this.setVertexData(this.data);
        return this.data;
    }
}
