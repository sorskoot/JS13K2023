import {cube, palette} from '../classes/Consts';
import {Cube1, Cube2, Cube3} from './Consts';
import {GL} from './GL';
import {Material} from './Material';
import {Matrix4} from './Matrix4';
import {Mesh} from './Mesh';
import {Shader} from './Shader';
import {SimpleShader} from './SimpleShader';
import {SubShader} from './SubShader';
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

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.color = [0.3, 0.3, 0.3, 1];
        this.gl.clearColor(0, 0, 0, 1);

        this.masks = gl.COLOR_BUFFER_BIT;
        this.depthTest = false;
        this.lightDirection.normalize();

        // Renderer.fSSC0 = `#version 300 es
        //     precision mediump float;

        //     out vec4 o_Color;

        //     in vec3 v_Normal;
        //     uniform vec4 u_Color;

        //     uniform vec3 uAmbientColor;
        //     uniform vec3 uLightingDirection;
        //     uniform vec3 uDirectionalColor;
        //     uniform mat4 u_View;

        //     `;
        // Renderer.fSSC1 = `void main() {
        //         o_Color = shader();
        //     }`;
        // Renderer.vSS = new SubShader(
        //     gl,
        //     gl.VERTEX_SHADER,
        //     `#version 300 es
        //     precision mediump float;

        //     in vec3 a_Position;

        //     //layout(location = 0) in vec3 a_Position;
        //     //layout(location = 1) in vec2 a_TexCoord;
        //     //layout(location = 2) in vec3 a_Normal;

        //     uniform mat4 u_Projection;
        //     uniform mat4 u_View;
        //     uniform mat4 u_Model;

        //     out vec3 v_Normal;
        //     out vec4 v_Position;

        //     void main() {
        //         mat4 modelViewMatrix = u_View * u_Model;

        //         // // mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));

        //         // // v_Normal = normalize(normalMatrix * a_Normal);
        //         v_Position = modelViewMatrix * vec4(a_Position, 1.0);
        //         gl_Position = u_Projection * v_Position;

        //     }`
        // );
        // (Renderer.fSS = new SubShader(
        //     gl,
        //     gl.FRAGMENT_SHADER,
        //     Renderer.fSSC0 +
        //         `
        //         // float fogFactorExp2(float dist, float density) {
        //         //     const float LOG2 = -1.442695;
        //         //     float d = density * dist;
        //         //     return 1.0 - clamp(exp2(d*d*LOG2), 0.0, 1.0);
        //         // }
        //         vec4 shader() {

        //             // float dist = gl_FragCoord.z/gl_FragCoord.w;
        //             // float fogFactor = fogFactorExp2(dist, 0.05);

        //             // vec3 ambientLightWeighting = uAmbientColor;

        //             // mat3 viewRotation = mat3(u_View);
        //             // vec3 lightDirectionInViewSpace = viewRotation * uLightingDirection;
        //             // vec3 lightDirection = normalize(-lightDirectionInViewSpace);
        //             // float directionalLightWeighting = max(dot(v_Normal, lightDirection), 0.0);

        //             // vec3 light = ambientLightWeighting + directionalLightWeighting * uDirectionalColor;
        //             // vec3 diffuse = u_Color.rgb* light;
        //             // vec4 final = mix(vec4(diffuse,1.0), vec4(0.5, 0.8, 1., 1.), fogFactor);
        //             // return final;
        //             return vec4(1.0,0.0,0.0, 1.0);
        //             //return vec4(fogFactor,fogFactor,fogFactor,1.0);
        //         }` +
        //         Renderer.fSSC1
        // )),
        //     (Renderer.triangle = [
        //         -0.5, -0.5, 0, 0, 0, 0, 0, 1, 0, 0.5, 0, 0.5, 1, 0, 0, 1, 0.5, -0.5, 0, 1,
        //         0, 0, 0, 1,
        //     ]);
        this.shader = new SimpleShader(gl);

        // this.material = new Material(gl);
        // this.material.shader.link();
        // //   this.vertexLayout();
        // this.material.shader.bind();

        // this.vertexArray = this.gl.createVertexArray();
        // this.gl.bindVertexArray(this.vertexArray);

        this.gl.useProgram(this.shader.program);
        this.positionBuffer = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, Cube2, this.gl.STATIC_DRAW);

        // this.gl.vertexAttribPointer(this.shader.positionLoc, 3, this.gl.FLOAT, true, 3 * 4, 0);
        // this.gl.enableVertexAttribArray(this.shader.positionLoc);

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

        // this.gl.bufferData(
        //     this.gl.ARRAY_BUFFER,
        //     new Float32Array([0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0]),
        //     this.gl.STATIC_DRAW
        // );

        // this.gl.vertexAttribPointer(this.shader.matrixLoc!, 1, this.gl.FLOAT_MAT4, false, 0, 0);
        // this.gl.vertexAttribDivisor(this.matrixBuffer!, 1);
        // this.gl.enableVertexAttribArray(this.matrixBuffer!);
        //this.shader.unbind();
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

    /**
     * Sets up the lighting for the given shader.
     * @param {Shader} shader - The shader to set up lighting for.
     */
    setupLight(shader: Shader) {
        shader.set3f('uAmbientColor', 0.3, 0.3, 0.3);
        shader.set3f('uLightingDirection', this.lightDirection.x, this.lightDirection.y, this.lightDirection.z);
        shader.set3f('uDirectionalColor', 0.9, 0.9, 0.9);
    }

    /**
     * Draws a mesh with the specified material.
     * @param mesh - The mesh to draw.
     * @param material - The material to use for drawing the mesh.
     */
    draw(mesh: Mesh, material: Material) {
        material.shader.bind();

        this.setupLight(material.shader);

        // for (let i = 0; i < material.textures.size; i++) {
        //     material.textures[i].bind(i);
        // }
        mesh.vertexbuffer.draw();
        material.shader.unbind();
    }

    draw2(
        colorData: number[],
        matrixData: Float32Array,
        numInstances: number,
        projectionMatrix: Float32Array,
        transform: XRRigidTransform
    ) {
        const numCubes = numInstances;
        const numVertices = 36 * numCubes;

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

        //this.gl.uniform1iv(this.shader.colorLoc!, colorData);

        if (this.gl.getError()) {
            console.log(this.gl.getError());
        }
        this.gl.drawArraysInstanced(GL.TRIANGLES, 0, 36, numCubes);
        //this.gl.useProgram(null);
    }
}
