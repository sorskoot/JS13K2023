import {GL} from './GL';
import {GlTexture} from './GlTexture';

export class Texture {
    texture: GlTexture;
    constructor(gl: WebGL2RenderingContext) {
        this.texture = new GlTexture(gl);
    }
    free() {
        this.texture.free();
    }

    loadFromFile(url, options = {wrap: GL.REPEAT, filter: GL.NEAREST}) {
        this.texture.fromFile(url, options);
    }
    loadFromData(data, options = {wrap: GL.REPEAT, filter: GL.NEAREST}) {
        this.texture.fromData(data, options);
    }
}
