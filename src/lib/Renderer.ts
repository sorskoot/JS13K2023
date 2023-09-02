import {palette} from '../classes/Consts';
import {Cube2} from './Consts';
//import {Cube2} from './Consts';
import {GL} from './GL';
import {Matrix4} from './Matrix4';
import {SimpleShader} from './SimpleShader';
import {Vector3} from './Vector3';

export class Renderer {
    private gl: WebGL2RenderingContext;
    private color: number[];
    masks: number;
    depthTest: boolean;
    static vSS: any;
    static fSS: any;
    static fSSC0: string;
    static fSSC1: string;
    static triangle: number[];

    // light shing down from the south east
    private lightDirection = new Vector3(-1, -1, -1);
    //material: Material;
    stride: number;
    positionBuffer: WebGLBuffer | null;
    shader: SimpleShader;
    vertexArray: WebGLVertexArrayObject | null;
    matrixBuffer: WebGLBuffer | null;

    constructor(gl: WebGL2RenderingContext, cube) {
        this.gl = gl;

        this.color = [0.3, 0.3, 0.3, 1];
        this.gl.clearColor(0, 0, 0, 1);

        this.masks = gl.COLOR_BUFFER_BIT;
        this.depthTest = false;
        this.lightDirection.normalize();

        this.shader = new SimpleShader(gl);

        this.gl.useProgram(this.shader.program);
        this.positionBuffer = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, Cube2, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(this.shader.positionLoc, 3, this.gl.FLOAT, false, 8 * 4, 0);
        this.gl.enableVertexAttribArray(this.shader.positionLoc);
        this.gl.vertexAttribPointer(this.shader.texCoordLoc, 2, this.gl.FLOAT, false, 8 * 4, 12);
        this.gl.enableVertexAttribArray(this.shader.texCoordLoc);
        this.gl.vertexAttribPointer(this.shader.normalLoc, 3, this.gl.FLOAT, false, 8 * 4, 20);
        this.gl.enableVertexAttribArray(this.shader.normalLoc);

        gl.uniform3fv(
            this.shader.colorsLoc,
            palette.flat().map((x) => x / 255)
        );

        gl.uniform3f(this.shader.ambientColorLoc!, 0.3, 0.3, 0.3);
        gl.uniform3f(
            this.shader.lightingDirectionLoc!,
            this.lightDirection.x,
            this.lightDirection.y,
            this.lightDirection.z
        );
        gl.uniform3f(this.shader.directionalColorLoc!, 0.9, 0.9, 0.9);
    }

    depthTesting(enable) {
        if (enable && !this.depthTest) {
            this.masks = GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT;
            this.gl.enable(GL.DEPTH_TEST);

            this.depthTest = true;
        } else if (!enable && this.depthTest) {
            this.masks = GL.COLOR_BUFFER_BIT;
            this.gl.disable(GL.DEPTH_TEST);

            this.depthTest = false;
        }
    }
    /**
     * Clears the canvas with the specified color.
     * @param color - An array of RGBA values between 0 and 1 representing the color to clear the canvas with.
     */
    clear(color = [0, 0, 0, 1]) {
        if (color != this.color) {
            this.gl.clearColor(color[0], color[1], color[2], color[3]);
            this.color = color;
        }
        this.gl.clear(this.masks);
    }

    draw2(
        colorData: number[],
        matrixData: Float32Array,
        numInstances: number,
        projectionMatrix: Float32Array,
        transform: XRRigidTransform
    ) {
        const numCubes = numInstances;

        this.gl.useProgram(this.shader.program);

        let inv = Matrix4.from(transform.inverse.matrix) as Matrix4;
        this.gl.uniformMatrix4fv(this.shader.viewLoc!, false, inv);
        this.gl.uniformMatrix4fv(this.shader.projectionLoc!, false, projectionMatrix);

        // this.gl.bindVertexArray(this.vertexArray);
        let colorbuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorbuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colorData), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.shader.colorLoc, 1, this.gl.FLOAT, false, 4, 0);
        this.gl.vertexAttribDivisor(this.shader.colorLoc, 1);
        this.gl.enableVertexAttribArray(this.shader.colorLoc);

        let matrixBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, matrixBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, matrixData, this.gl.STATIC_DRAW);

        // Define 4 vertex attributes for the 4 columns of each matrix
        let matloc = this.shader.matrixLoc;

        this.gl.vertexAttribPointer(matloc + 0, 4, this.gl.FLOAT, false, 64, 0);
        this.gl.vertexAttribPointer(matloc + 1, 4, this.gl.FLOAT, false, 64, 16);
        this.gl.vertexAttribPointer(matloc + 2, 4, this.gl.FLOAT, false, 64, 32);
        this.gl.vertexAttribPointer(matloc + 3, 4, this.gl.FLOAT, false, 64, 48);

        this.gl.vertexAttribDivisor(matloc + 0, 1);
        this.gl.vertexAttribDivisor(matloc + 1, 1);
        this.gl.vertexAttribDivisor(matloc + 2, 1);
        this.gl.vertexAttribDivisor(matloc + 3, 1);

        this.gl.enableVertexAttribArray(matloc + 0);
        this.gl.enableVertexAttribArray(matloc + 1);
        this.gl.enableVertexAttribArray(matloc + 2);
        this.gl.enableVertexAttribArray(matloc + 3);

        this.gl.drawArraysInstanced(GL.TRIANGLES, 0, 36, numCubes);
    }
}
