const GL = WebGLRenderingContext; // For enums

export const CAP = {
    // Enable caps
    CULL_FACE: 0x001,
    BLEND: 0x002,
    DEPTH_TEST: 0x004,
    COLOR_MASK: 0x010,
    DEPTH_MASK: 0x020,
};

export const MAT_STATE = {
    CAPS_RANGE: 0x000000ff,
    BLEND_SRC_SHIFT: 8,
    BLEND_SRC_RANGE: 0x00000f00,
    BLEND_DST_SHIFT: 12,
    BLEND_DST_RANGE: 0x0000f000,
    BLEND_FUNC_RANGE: 0x0000ff00,
    DEPTH_FUNC_SHIFT: 16,
    DEPTH_FUNC_RANGE: 0x000f0000,
};

export const RENDER_ORDER = {
    // Render opaque objects first.
    OPAQUE: 0,

    // Render the sky after all opaque object to save fill rate.
    SKY: 1,

    // Render transparent objects next so that the opaqe objects show through.
    TRANSPARENT: 2,

    // Finally render purely additive effects like pointer rays so that they
    // can render without depth mask.
    ADDITIVE: 3,

    // Render order will be picked based on the material properties.
    DEFAULT: 4,
};

export function stateToBlendFunc(state, mask, shift) {
    let value = (state & mask) >> shift;
    switch (value) {
        case 0:
        case 1:
            return value;
        default:
            return value - 2 + GL.SRC_COLOR;
    }
}

export class MaterialState {
    private _state: number;
    constructor() {
        this._state = CAP.CULL_FACE | CAP.DEPTH_TEST | CAP.COLOR_MASK | CAP.DEPTH_MASK;

        // Use a fairly commonly desired blend func as the default.
        this.blendFuncSrc = GL.SRC_ALPHA;
        this.blendFuncDst = GL.ONE_MINUS_SRC_ALPHA;

        this.depthFunc = GL.LESS;
    }

    get cullFace() {
        return !!(this._state & CAP.CULL_FACE);
    }
    set cullFace(value) {
        if (value) {
            this._state |= CAP.CULL_FACE;
        } else {
            this._state &= ~CAP.CULL_FACE;
        }
    }

    get blend() {
        return !!(this._state & CAP.BLEND);
    }
    set blend(value) {
        if (value) {
            this._state |= CAP.BLEND;
        } else {
            this._state &= ~CAP.BLEND;
        }
    }

    get depthTest() {
        return !!(this._state & CAP.DEPTH_TEST);
    }
    set depthTest(value) {
        if (value) {
            this._state |= CAP.DEPTH_TEST;
        } else {
            this._state &= ~CAP.DEPTH_TEST;
        }
    }

    get colorMask() {
        return !!(this._state & CAP.COLOR_MASK);
    }
    set colorMask(value) {
        if (value) {
            this._state |= CAP.COLOR_MASK;
        } else {
            this._state &= ~CAP.COLOR_MASK;
        }
    }

    get depthMask() {
        return !!(this._state & CAP.DEPTH_MASK);
    }
    set depthMask(value) {
        if (value) {
            this._state |= CAP.DEPTH_MASK;
        } else {
            this._state &= ~CAP.DEPTH_MASK;
        }
    }

    get depthFunc() {
        return (
            ((this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT) +
            GL.NEVER
        );
    }
    set depthFunc(value) {
        value = value - GL.NEVER;
        this._state &= ~MAT_STATE.DEPTH_FUNC_RANGE;
        this._state |= value << MAT_STATE.DEPTH_FUNC_SHIFT;
    }

    get blendFuncSrc() {
        return stateToBlendFunc(
            this._state,
            MAT_STATE.BLEND_SRC_RANGE,
            MAT_STATE.BLEND_SRC_SHIFT
        );
    }
    set blendFuncSrc(value) {
        switch (value) {
            case 0:
            case 1:
                break;
            default:
                value = value - GL.SRC_COLOR + 2;
        }
        this._state &= ~MAT_STATE.BLEND_SRC_RANGE;
        this._state |= value << MAT_STATE.BLEND_SRC_SHIFT;
    }

    get blendFuncDst() {
        return stateToBlendFunc(
            this._state,
            MAT_STATE.BLEND_DST_RANGE,
            MAT_STATE.BLEND_DST_SHIFT
        );
    }
    set blendFuncDst(value) {
        switch (value) {
            case 0:
            case 1:
                break;
            default:
                value = value - GL.SRC_COLOR + 2;
        }
        this._state &= ~MAT_STATE.BLEND_DST_RANGE;
        this._state |= value << MAT_STATE.BLEND_DST_SHIFT;
    }
}

class MaterialSampler {
    private _uniformName: any;
    private _texture: null;
    constructor(uniformName) {
        this._uniformName = uniformName;
        this._texture = null;
    }

    get texture() {
        return this._texture;
    }

    set texture(value) {
        this._texture = value;
    }
}

class MaterialUniform {
    private _uniformName: any;
    private _value: any;
    private _length: any;
    constructor(uniformName, defaultValue, length) {
        this._uniformName = uniformName;
        this._value = defaultValue;
        this._length = length;
        if (!this._length) {
            if (defaultValue instanceof Array) {
                this._length = defaultValue.length;
            } else {
                this._length = 1;
            }
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

export class Material {
    state: MaterialState;
    renderOrder: number;
    _samplers: MaterialSampler[];
    _uniforms: MaterialUniform[];
    constructor() {
        this.state = new MaterialState();
        this.renderOrder = RENDER_ORDER.DEFAULT;
        this._samplers = [];
        this._uniforms = [];
    }

    defineSampler(uniformName) {
        let sampler = new MaterialSampler(uniformName);
        this._samplers.push(sampler);
        return sampler;
    }

    defineUniform(uniformName, defaultValue = null, length = 0) {
        let uniform = new MaterialUniform(uniformName, defaultValue, length);
        this._uniforms.push(uniform);
        return uniform;
    }

    get materialName(): string | null {
        return null;
    }

    get vertexSource(): string | null {
        return null;
    }

    get fragmentSource(): string | null {
        return null;
    }

    getProgramDefines(renderPrimitive) {
        return {};
    }
}
