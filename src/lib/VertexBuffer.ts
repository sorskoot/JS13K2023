import {GL} from './GL';

export class VertexBuffer {
    stride: number;
    length: number;
    vertices: number;
    va: WebGLVertexArrayObject | null;
    vb: WebGLBuffer | null;
    gl: WebGL2RenderingContext;

    // both vertex buffer and vertex array, whereas the vertex array is here only to store the vertex layout
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.va = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.va);

        this.vb = this.gl.createBuffer();
        this.gl.bindBuffer(GL.ARRAY_BUFFER, this.vb);

        this.stride = 0;
        this.length = 0;
        this.vertices = 0;

        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
    }
    free() {
        // free functions - they just delete all the WebGL2 objects created with the object
        this.gl.deleteBuffer(this.vb);
        this.gl.deleteVertexArray(this.va);
    }

    vertexLayout(layout = [3, 2, 3]) {
        // this function supplies the vertex layout - it says how many elements there are per vertex, and how much floats they take up. we will mostly use the [3, 2, 3] combination, because it's the one used by OBJ models
        for (let i = 0; i < layout.length; i++) {
            this.stride += layout[i] * 4;
        }

        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(GL.ARRAY_BUFFER, this.vb);

        let istride = 0;
        for (let i = 0; i < layout.length; i++) {
            this.gl.vertexAttribPointer(
                i,
                layout[i],
                GL.FLOAT,
                false,
                this.stride,
                istride
            );
            this.gl.enableVertexAttribArray(i);

            istride += layout[i] * 4;
        }

        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);

        this.stride = this.stride / 4;
        this.vertices = this.length / this.stride;
    }
    vertexData(data) {
        // simply takes in a Float32Array and supplies it to the buffer
        this.length = data.length;
        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(GL.ARRAY_BUFFER, this.vb);
        this.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(data), GL.STATIC_DRAW);
        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
        this.vertices = this.length / this.stride;
    }
    draw() {
        // draws our mesh
        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(GL.ARRAY_BUFFER, this.vb);

        this.gl.drawArrays(GL.TRIANGLES, 0, this.vertices);

        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
    }
}
