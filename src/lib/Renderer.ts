import {GL} from './GL';
import {Material} from './Material';
import {Matrix4} from './Matrix4';
import {Mesh} from './Mesh';
import {Shader} from './Shader';
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

    private lightDirection = new Vector3(-1, -0.75, -0.75);

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.color = [0.3, 0.3, 0.3, 1];
        this.gl.clearColor(0, 0, 0, 1);

        this.masks = gl.COLOR_BUFFER_BIT;
        this.depthTest = false;
        this.lightDirection.normalize();

        Renderer.fSSC0 = `#version 300 es
            precision mediump float;
            
            out vec4 o_Color;

            in vec3 v_Normal;
            uniform vec4 u_Color;
            
            uniform vec3 uAmbientColor;
            uniform vec3 uLightingDirection;
            uniform vec3 uDirectionalColor;
            uniform mat4 u_View;

            `;
        Renderer.fSSC1 = `void main() {
                o_Color = shader();
            }`;
        Renderer.vSS = new SubShader(
            gl,
            gl.VERTEX_SHADER,
            `#version 300 es
            precision mediump float;
            
            layout(location = 0) in vec3 a_Position;
            layout(location = 1) in vec2 a_TexCoord;
            layout(location = 2) in vec3 a_Normal;
            
            uniform mat4 u_Projection;
            uniform mat4 u_View;
            uniform mat4 u_Model;

            out vec3 v_Normal;  
            out vec4 v_Position;          
            
            void main() {
                mat4 modelViewMatrix = u_View * u_Model;

                mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));

                v_Normal = normalMatrix * a_Normal;
                v_Position = modelViewMatrix * vec4(a_Position, 1.0);
                gl_Position = u_Projection * v_Position;
            }`
        );
        (Renderer.fSS = new SubShader(
            gl,
            gl.FRAGMENT_SHADER,
            Renderer.fSSC0 +
                `
                vec4 shader() { 
                    vec3 ambientLightWeighting = uAmbientColor;

                    mat3 viewRotation = mat3(u_View);
                    vec3 lightDirectionInViewSpace = viewRotation * uLightingDirection; 
    
                    // Calculate directional lighting
                    vec3 lightDirection = normalize(-lightDirectionInViewSpace);
                    float directionalLightWeighting = max(dot(v_Normal, lightDirection), 0.0);
                
                    // Combine the lighting calculations into final color value for this fragment.
                    vec3 light = ambientLightWeighting + directionalLightWeighting * uDirectionalColor;

                    vec3 diffuse = u_Color.rgb * light;
                
                    return vec4(diffuse, 1.0);
                }` +
                Renderer.fSSC1
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

    setupLight(shader: Shader) {
        shader.set3f('uAmbientColor', 0.2, 0.2, 0.2);
        shader.set3f(
            'uLightingDirection',
            this.lightDirection.x,
            this.lightDirection.y,
            this.lightDirection.z
        );
        shader.set3f('uDirectionalColor', 0.8, 0.8, 0.8);
    }

    draw(mesh: Mesh, material: Material) {
        material.shader.bind();

        this.setupLight(material.shader);

        // for (let i = 0; i < material.textures.size; i++) {
        //     material.textures[i].bind(i);
        // }
        mesh.vertexbuffer.draw();
        material.shader.unbind();
    }
}
