export class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    // known as a program in WebGL2, just joins and links shaders
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.program = gl.createProgram()!;
    }
    free() {
        this.gl.deleteProgram(this.program);
    }

    join(subshader) {
        this.gl.attachShader(this.program, subshader.shader);
        return this;
    }
    link() {
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        this.gl.useProgram(null);
        return this;
    }

    bind() {
        this.gl.useProgram(this.program);
        return this;
    }
    unbind() {
        this.gl.useProgram(null);
        return this;
    }

    // these are used for setting uniforms in shaders
    set1i(name, val) {
        // mostly for texture IDs
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), val);
        return this;
    }
    set1f(name, val) {
        // maybe will find some kind of a use
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), val);
        return this;
    }
    set2f(name, x, y) {
        // maybe will find some kind of a use
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), x, y);
        return this;
    }
    set3f(name, x, y, z) {
        // maybe will find some kind of a use
        this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), x, y, z);
        return this;
    }
    set4f(name, x, y, z, w) {
        // maybe will find some kind of a use (most likely colors)
        this.gl.uniform4f(this.gl.getUniformLocation(this.program, name), x, y, z, w);
        return this;
    }
    set4x4f(name, mat) {
        // for matrices (projection, view, model)
        this.gl.uniformMatrix4fv(
            this.gl.getUniformLocation(this.program, name),
            false,
            mat
        );
        return this;
    }
}
