import {GL} from './GL';
import {Texture} from './Texture';
import {GlTexture} from './GlTexture';
import {Shader} from './Shader';
import {SubShader} from './SubShader';
import {Renderer} from './Renderer';
import {identityMatrix} from './Consts';

/**
 * Represents a material that can be applied to a mesh for rendering.
 */
export class Material {
    shader: Shader;
    textures: GlTexture[];

    /**
     * Creates a new Material object.
     * @constructor
     * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
     * @param {string} [customShader=null] - A custom shader to use instead of the default one.
     */
    constructor(gl: WebGL2RenderingContext, customShader = null) {
        this.shader = new Shader(gl);
        this.shader.join(Renderer.vSS);
        if (!customShader) {
            this.shader.join(Renderer.fSS);
            this.shader.link();
        } else {
            let fSS = new SubShader(
                gl,
                GL.FRAGMENT_SHADER,
                Renderer.fSSC0 + customShader + Renderer.fSSC1
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

        this.setProjection(identityMatrix);
        this.setView(identityMatrix);
        this.setModel(identityMatrix);
    }
    /**
     * Frees the resources used by this material.
     * This method should be called when the material is no longer needed to prevent memory leaks.
     */
    free() {
        this.shader.free();
    }

    /**
     * Sets the projection matrix for this material.
     * @param mat - The projection matrix to set.
     */
    setProjection(mat: Float32List) {
        this.shader.bind();
        this.shader.set4x4f('u_Projection', mat);
        this.shader.unbind();
    }

    /**
     * Sets the view matrix for this material.
     * @param mat - The view matrix to set.
     */
    setView(mat: Float32List) {
        this.shader.bind();
        this.shader.set4x4f('u_View', mat);
        this.shader.unbind();
    }

    /**
     * Sets the model matrix for this material.
     * @param mat - The model matrix to set.
     */
    setModel(mat: Float32List) {
        this.shader.bind();
        this.shader.set4x4f('u_Model', mat);
        this.shader.unbind();
    }
    /**
     * Sets the color of the material.
     * @param rgb color in RGB format, each value ranging from 0 to 255
     */
    setColor(rgb = [255, 255, 255]) {
        this.shader.bind();
        this.shader.set4f('u_Color', rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1);
        this.shader.unbind();
    }

    /**
     * Sets a texture for this material.
     * @param texture - The texture to set.
     * @param slot - The texture slot to set the texture to. Defaults to 0.
     */
    setTexture(texture: Texture, slot = 0) {
        this.textures[slot] = texture.texture;
    }
}
