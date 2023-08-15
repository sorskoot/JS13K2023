import {Texture} from './Texture';

export class TextureLoader {
    texture: Texture;
    gl: WebGL2RenderingContext;
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.texture = new Texture(gl);
    }
    free() {
        this.texture.free();
    }

    loadFromFile(url, options = {wrap: this.gl.REPEAT, filter: this.gl.NEAREST}) {
        this.texture.fromFile(url, options);
    }
    loadFromData(data, options = {wrap: this.gl.REPEAT, filter: this.gl.NEAREST}) {
        this.texture.fromData(data, options);
    }
}
