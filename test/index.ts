class Game {
    gl: WebGL2RenderingContext;
    resources: {
        positionBuffer: WebGLBuffer | null;
        colorBuffer: WebGLBuffer | null;
        offsetBuffer: WebGLBuffer | null;
        program: WebGLProgram | null;
        vertexArray: WebGLVertexArrayObject | null;
    };

    constructor() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    }

    onInitialize(): void {
        this.gl.clearColor(0, 0, 0, 1);

        const program = this.compileShader();

        const vertexArray = this.gl.createVertexArray();
        this.gl.bindVertexArray(vertexArray);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
                0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
                -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
                -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
            ]),

            this.gl.STATIC_DRAW
        );

        const positionLocation = this.gl.getAttribLocation(program, 'vPosition');
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLocation);

        // const colorBuffer = this.gl.createBuffer();
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        // this.gl.bufferData(
        //     this.gl.ARRAY_BUFFER,
        //     new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]),
        //     this.gl.STATIC_DRAW
        // );

        // const colorLocation = this.gl.getAttribLocation(program, 'color');
        // this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);

        // this.gl.vertexAttribDivisor(colorLocation, 1);
        // this.gl.enableVertexAttribArray(colorLocation);

        const offsetBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, offsetBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0]),
            this.gl.STATIC_DRAW
        );

        const offsetLocation = this.gl.getAttribLocation(program, 'vOffset');
        this.gl.vertexAttribPointer(offsetLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(offsetLocation, 1);
        this.gl.enableVertexAttribArray(offsetLocation);

        // this.gl.bindVertexArray(null);

        this.resources = {
            positionBuffer,
            colorBuffer: null,
            offsetBuffer: null,
            program,
            vertexArray,
        };

        requestAnimationFrame(() => this.onRender());
    }

    private compileShader() {
        const vs = `
        precision highp float;

        //uniform mat4 uModelViewMatrix;
        attribute vec4 vOffset;
        attribute vec4 vPosition;
        
        
        void main() {
            gl_Position = vPosition+vOffset;
        }
    `;
        const fs = `
      precision highp float;

      void main() {
        gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
      }
    `;

        const vShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vShader, vs);
        this.gl.compileShader(vShader);
        if (!this.gl.getShaderParameter(vShader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(vShader);
            throw `Could not compile WebGL program. \n\n${info}`;
        }

        const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fShader, fs);
        this.gl.compileShader(fShader);
        const deb = this.gl.getExtension('WEBGL_debug_shaders');

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);

        // console.log(deb?.getTranslatedShaderSource(vShader));
        return program;
    }

    onRender(): void {
        // schedule next frame
        requestAnimationFrame(() => this.onRender());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.bindVertexArray(this.resources.vertexArray);

        this.gl.useProgram(this.resources.program);

        //this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 3, 4);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 36, 4);
    }
}

let game = new Game();
game.onInitialize();
