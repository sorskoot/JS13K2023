import {Texture} from './Texture';
import {Shader} from './Shader';
import {SubShader} from './SubShader';
import {Renderer} from './Renderer';

export class Material {
    shader: Shader;
    textures: Texture[];
    constructor(gl: WebGL2RenderingContext, customShader = null) {
        this.shader = new Shader(gl);
        this.shader.join(Renderer.vSS);
        if (!customShader) {
            this.shader.join(Renderer.fSS);
            this.shader.link();
        } else {
            let fSS = new SubShader(
                gl.FRAGMENT_SHADER,
                Renderer.fSSC0 + customShader + Renderer.fSSC1,
                gl
            );
            this.shader.join(fSS);
            this.shader.link();
            fSS.free();
        }

        this.shader.bind();
        this.textures = [];
        this.shader.set4f('u_Color', 1, 1, 1, 1);
        for (let i = 0; i < 16; i++) {
            this.shader.set1i('u_TexID[' + i + ']', i);
        }
        this.shader.unbind();
    }
    free() {
        this.shader.free();
    }

    setProjection(mat) {
        this.shader.bind();
        this.shader.set4x4f('u_Projection', mat);
        this.shader.unbind();
    }
    setView(mat) {
        this.shader.bind();
        this.shader.set4x4f('u_View', mat);
        this.shader.unbind();
    }
    setModel(mat) {
        this.shader.bind();
        this.shader.set4x4f('u_Model', mat);
        this.shader.unbind();
    }

    setColor(rgba = [1, 1, 1, 1]) {
        this.shader.bind();
        this.shader.set4f('u_Color', rgba[0], rgba[1], rgba[2], rgba[3]);
        this.shader.unbind();
    }

    setTexture(texture: Texture, slot = 0) {
        this.textures[slot] = texture;
    }
}
