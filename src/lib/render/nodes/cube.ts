import {Material} from '../core/material';
import {Node} from '../core/node';
import {Primitive, PrimitiveAttribute} from '../core/primitive';

const GL = WebGLRenderingContext;

export class FlatMaterial extends Material {
    constructor() {
        super();
    }

    get materialName() {
        return 'FLAT';
    }

    get vertexSource() {
        return `
        attribute vec3 POSITION;
        attribute vec2 TEXCOORD_0;
    
        varying vec2 vTexCoord;
    
        vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
          vTexCoord = TEXCOORD_0;
          vec4 pos = vec4(POSITION.x, POSITION.y, POSITION.z, 1.0);
          return proj * view * model * pos;
        }`;
    }

    get fragmentSource() {
        return `
        varying vec2 vTexCoord;
    
        vec4 fragment_main() {
          return vec4(1.0, .2, .4, 1.0);
        }`;
    }
}

export class Cube extends Node {
    material: Material;
    constructor(material: Material) {
        super();
        this.material = material;
    }
    onRendererChanged(renderer) {
        let vertices: number[] = [];
        vertices.push(-1, 1, 0, 0, 0, 0, 0, 1);
        vertices.push(-1, -1, 0, 0, 1, 0, 0, 1);
        vertices.push(1, -1, 0, 1, 1, 0, 0, 1);
        vertices.push(1, 1, 0, 1, 0, 0, 0, 1);
        let indices: number[] = [];
        indices.push(0, 1, 2);
        indices.push(0, 2, 3);

        let vertexBuffer = renderer.createRenderBuffer(
            GL.ARRAY_BUFFER,
            new Float32Array(vertices)
        );
        let indexBuffer = renderer.createRenderBuffer(
            GL.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices)
        );

        let attribs = [
            new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 32, 0),
            new PrimitiveAttribute('TEXCOORD_0', vertexBuffer, 2, GL.FLOAT, 32, 12),
            new PrimitiveAttribute('NORMAL', vertexBuffer, 3, GL.FLOAT, 32, 20),
        ];

        let primitive = new Primitive(attribs, indices.length);
        primitive.setIndexBuffer(indexBuffer);

        let renderPrimitive = renderer.createRenderPrimitive(primitive, this.material);
        this.addRenderPrimitive(renderPrimitive);
    }
}
