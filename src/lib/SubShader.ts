export class SubShader {
    gl: WebGL2RenderingContext;
    shader: WebGLShader;

    // known as shader in WebGL2, simply contains shader code and type
    constructor(gl: WebGL2RenderingContext, type, str) {
        this.gl = gl;
        this.shader = this.gl.createShader(type)!;
        this.gl.shaderSource(this.shader, str);
        this.gl.compileShader(this.shader);

        const message = this.gl.getShaderInfoLog(this.shader)!;
        if (message.length > 0) {
            throw message;
        }
    }
    free() {
        this.gl.deleteShader(this.shader);
    }
}
