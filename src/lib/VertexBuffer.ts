export interface Vertex {
    position: {x: number; y: number; z: number};
    uv: {u: number; v: number};
    normal: {x: number; y: number; z: number};
}

export class VertexBuffer {
    va: WebGLVertexArrayObject | null;
    vb: WebGLBuffer | null;
    stride: number;
    length: number;
    vertices: number;
    gl: WebGL2RenderingContext;

    // both vertex buffer and vertex array, whereas the vertex array is here only to store the vertex layout
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.va = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.va);

        this.vb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vb);

        this.stride = 0;
        this.length = 0;
        this.vertices = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
    }
    free() {
        // free functions - they just delete all the WebGL2 objects created with the object
        this.gl.deleteBuffer(this.vb);
        this.gl.deleteVertexArray(this.va);
    }

    /**
     * Sets the vertex layout
     * @param layout The vertex layout
     */
    vertexLayout(layout = [3, 2, 3]) {
        for (let i = 0; i < layout.length; i++) {
            this.stride += layout[i] * 4;
        }

        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vb);

        let istride = 0;
        for (let i = 0; i < layout.length; i++) {
            this.gl.vertexAttribPointer(
                i,
                layout[i],
                this.gl.FLOAT,
                false,
                this.stride,
                istride
            );
            this.gl.enableVertexAttribArray(i);

            istride += layout[i] * 4;
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);

        this.stride = this.stride / 4;
        this.vertices = this.length / this.stride;
    }
    vertexData(data: number[]) {
        this.length = data.length;
        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vb);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(data),
            this.gl.STATIC_DRAW
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
        this.vertices = this.length / this.stride;
    }

    draw() {
        this.gl.bindVertexArray(this.va);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vb);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
    }
}
