import {GL} from './GL';
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

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.color = [0.3, 0.3, 0.3, 1];
        this.gl.clearColor(0, 0, 0, 1);

        this.masks = gl.COLOR_BUFFER_BIT;
        this.depthTest = false;

        Renderer.fSSC0 =
            '#version 300 es\n\
            precision mediump float;\n\
            \n\
            out vec4 o_Color;\n\
            \n\
            in vec2 v_TexCoord;\n\
            \n\
            uniform vec4 u_Color;\n\
            uniform sampler2D u_TexID[16];\n';
        Renderer.fSSC1 =
            '\nvoid main() {\n\
                o_Color = shader();\n\
            }';
        Renderer.vSS = new SubShader(
            gl,
            gl.VERTEX_SHADER,
            '#version 300 es\n\
            precision mediump float;\n\
            \n\
            layout(location = 0) in vec3 a_Position;\n\
            layout(location = 1) in vec2 a_TexCoord;\n\
            layout(location = 2) in vec3 a_Normal;\n\
            \n\
            uniform mat4 u_Projection;\n\
            uniform mat4 u_View;\n\
            uniform mat4 u_Model;\n\
            \n\
            out vec2 v_TexCoord;\n\
            \n\
            void main() {\n\
            gl_Position = u_Projection * u_View * u_Model * vec4(a_Position, 1.0);\n\
                v_TexCoord = a_TexCoord;\n\
                v_TexCoord.y = 1.0 - v_TexCoord.y;\n\
            }'
        );
        (Renderer.fSS = new SubShader(
            gl,
            gl.FRAGMENT_SHADER,
            Renderer.fSSC0 + '\nvec4 shader() { return u_Color; }\n' + Renderer.fSSC1
        )),
            (Renderer.triangle = [
                -0.5, -0.5, 0, 0, 0, 0, 0, 1, 0, 0.5, 0, 0.5, 1, 0, 0, 1, 0.5, -0.5, 0, 1,
                0, 0, 0, 1,
            ]);
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
    clear(color = [0, 0, 0, 1]) {
        if (color != this.color) {
            this.gl.clearColor(color[0], color[1], color[2], color[3]);
            this.color = color;
        }
        this.gl.clear(this.masks);
    }
    draw(mesh, material) {
        material.shader.bind();
        for (let i = 0; i < material.textures.size; i++) {
            material.textures[i].bind(i);
        }
        mesh.vertexbuffer.draw();
        material.shader.unbind();
    }
}
