import {vec3} from '../math/gl-matrix.js';

export class PrimitiveAttribute {
    name: any;
    buffer: any;
    componentCount: any;
    componentType: any;
    stride: any;
    byteOffset: any;
    normalized: boolean;
    constructor(name, buffer, componentCount, componentType, stride, byteOffset) {
        this.name = name;
        this.buffer = buffer;
        this.componentCount = componentCount || 3;
        this.componentType = componentType || 5126; // gl.FLOAT;
        this.stride = stride || 0;
        this.byteOffset = byteOffset || 0;
        this.normalized = false;
    }
}

export class Primitive {
    attributes: any;
    elementCount: any;
    mode: any;
    indexBuffer: null;
    indexByteOffset: number;
    indexType: number;
    _min: null;
    _max: null;
    constructor(attributes, elementCount) {
        this.attributes = attributes || [];
        this.elementCount = elementCount || 0;
        this.mode = 4; // gl.TRIANGLES;
        this.indexBuffer = null;
        this.indexByteOffset = 0;
        this.indexType = 0;
        this._min = null;
        this._max = null;
    }

    setIndexBuffer(indexBuffer, byteOffset = 0, indexType = 5123) {
        this.indexBuffer = indexBuffer;
        this.indexByteOffset = byteOffset || 0;
        this.indexType = indexType || 5123; // gl.UNSIGNED_SHORT;
    }

    setBounds(min, max) {
        this._min = vec3.clone(min);
        this._max = vec3.clone(max);
    }
}
