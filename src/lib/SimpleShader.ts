export class SimpleShader {
    gl: WebGL2RenderingContext;
    program?: WebGLProgram;

    projectionLoc?: WebGLUniformLocation;
    viewLoc?: WebGLUniformLocation;
    ambientColorLoc?: WebGLUniformLocation;
    lightingDirectionLoc?: WebGLUniformLocation;
    directionalColorLoc?: WebGLUniformLocation;

    positionLoc = 0;
    texCoordLoc = 1;
    normalLoc = 2;
    colorLoc = 3;
    matrixLoc = 4;
    colorsLoc?: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.compileShader();
    }
    /**
     * [-1,0,-1,     1,0,0,       1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0  ]
     */

    private compileShader() {
        const vs = `#version 300 es
    #pragma vscode_glsllint_stage: vert
    precision mediump float;

    layout(location=0) in vec3 aPosition;
    layout(location=1) in vec2 aTexCoord;
    layout(location=2) in vec3 aNormal;
    layout(location=3) in float aColor;
    layout(location=4) in mat4 aModel;

    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform vec3 uColors[10];

    uniform vec3 uLightingDirection;

    out vec4 vPosition;
    out vec3 vColor;
    out vec3 vNormal;
    out vec4 vLightDirection;

    void main() {
        vColor = uColors[uint(aColor)];
        mat4 modelViewMatrix = uView * aModel;
        
        mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));
        vNormal = normalize(normalMatrix * aNormal);
        vLightDirection = uView * vec4(uLightingDirection, 1.0);
        vPosition = modelViewMatrix * vec4(aPosition, 1.0);
        gl_Position = uProjection * vPosition;
    }
`;
        const fs = `#version 300 es
        #pragma vscode_glsllint_stage: frag
  precision mediump float;

  uniform vec3 uAmbientColor;
  uniform vec3 uDirectionalColor;
  uniform mat4 uView;

  in vec3 vColor;
  in vec3 vNormal;
  in vec4 vLightDirection;
  out vec4 oColor;

  float fogFactorExp2(float dist, float density) {
    const float LOG2 = -1.442695;
    float d = density * dist;
    return 1.0 - clamp(exp2(d*d*LOG2), 0.0, 1.0);
  }

  void main() {
    float dist = gl_FragCoord.z/gl_FragCoord.w;
    float fogFactor = fogFactorExp2(dist, 0.035);

    float directionalLightIntensity = max(0.0, dot(vNormal, normalize(-vLightDirection.xyz)));

    vec3 light = uAmbientColor + directionalLightIntensity * uDirectionalColor;
    vec3 diffuse = vColor.rgb * light;
    oColor  = mix(vec4(diffuse,1.0), vec4(0.5, 0.8, 1., 1.), fogFactor);
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
        if (!this.gl.getShaderParameter(fShader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(fShader);
            throw `Could not compile WebGL program. \n\n${info}`;
        }
        //const deb = this.gl.getExtension('WEBGL_debug_shaders');

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error(`Could not compile WebGL program. \n\n${info}`);
        }

        this.projectionLoc = this.gl.getUniformLocation(program, 'uProjection')!;
        this.viewLoc = this.gl.getUniformLocation(program, 'uView')!;
        this.colorsLoc = this.gl.getUniformLocation(program, 'uColors')!;
        this.ambientColorLoc = this.gl.getUniformLocation(program, 'uAmbientColor')!;
        this.lightingDirectionLoc = this.gl.getUniformLocation(program, 'uLightingDirection')!;
        this.directionalColorLoc = this.gl.getUniformLocation(program, 'uDirectionalColor')!;
        this.gl.enableVertexAttribArray(this.matrixLoc);
        this.program = program;
    }
}
