export class SubShader {
    shader: WebGLShader | null;
    gl: WebGL2RenderingContext;

    // known as shader in WebGL2, simply contains shader code and type
    constructor(type: number, str: string, gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.shader = this.gl.createShader(type);
        this.gl.shaderSource(this.shader!, str);
        this.gl.compileShader(this.shader!);
    }
    free() {
        this.gl.deleteShader(this.shader);
    }
}
