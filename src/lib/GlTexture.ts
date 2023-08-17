import {GL} from './GL';

/**
 * Represents a WebGL texture.
 */
export class GlTexture {
    texture: WebGLTexture;
    gl: WebGL2RenderingContext;
    // Just a simple texture, and it can be loaded from a file
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.texture = this.gl.createTexture()!;
        this.gl.bindTexture(GL.TEXTURE_2D, this.texture);
        this.gl.bindTexture(GL.TEXTURE_2D, null);
    }
    free() {
        this.gl.deleteTexture(this.texture);
    }

    fromFile(url, options = {wrap: GL.REPEAT, filter: GL.NEAREST}) {
        this.gl.bindTexture(GL.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
            GL.TEXTURE_2D,
            0,
            GL.RGBA,
            1,
            1,
            0,
            GL.RGBA,
            GL.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255])
        );
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, options.wrap);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, options.wrap);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, options.filter);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, options.filter);
        let that = this;
        const img = new Image();
        img.onload = () => {
            this.gl.bindTexture(GL.TEXTURE_2D, that.texture);
            this.gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
        };
        img.src = url;
    }
    fromData(data, options = {wrap: GL.REPEAT, filter: GL.NEAREST}) {
        this.gl.bindTexture(GL.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
            GL.TEXTURE_2D,
            0,
            GL.RGBA,
            1,
            1,
            0,
            GL.RGBA,
            GL.UNSIGNED_BYTE,
            new Uint8Array(data)
        );
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, options.wrap);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, options.wrap);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, options.filter);
        this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, options.filter);
    }

    bind(slot = 0) {
        this.gl.activeTexture(GL.TEXTURE0 + slot);
        this.gl.bindTexture(GL.TEXTURE_2D, this.texture);
    }
}
