import {mat4, vec3, quat} from '../math/gl-matrix.js';
import {RenderPrimitive} from './renderer.js';

const DEFAULT_TRANSLATION = new Float32Array([0, 0, 0]);
const DEFAULT_ROTATION = new Float32Array([0, 0, 0, 1]);
const DEFAULT_SCALE = new Float32Array([1, 1, 1]);

let tmpRayMatrix = mat4.create();

export class Node {
    name: string;
    children: Node[];
    parent: Node | null;
    visible: boolean;
    _matrix: null;
    translation: null;
    rotation: null;
    scale: null;
    _worldMatrix: null;
    _activeFrameId: number;
    _hoverFrameId: number;
    _renderPrimitives: RenderPrimitive[];
    _renderer: null;

    constructor() {
        this.name = ''; // Only for debugging
        this.children = [];
        this.parent = null;
        this.visible = true;

        this._matrix = null;

        this.translation = null;
        this.rotation = null;
        this.scale = null;

        this._worldMatrix = null;

        this._activeFrameId = -1;
        this._hoverFrameId = -1;
        this._renderPrimitives = [];
        this._renderer = null;
    }

    _setRenderer(renderer) {
        if (this._renderer == renderer) {
            return;
        }

        if (this._renderer) {
            // Changing the renderer removes any previously attached renderPrimitives
            // from a different renderer.
            this.clearRenderPrimitives();
        }

        this._renderer = renderer;
        if (renderer) {
            this.onRendererChanged(renderer);

            for (let child of this.children) {
                child._setRenderer(renderer);
            }
        }
    }

    onRendererChanged(renderer) {
        // Override in other node types to respond to changes in the renderer.
    }

    // Create a clone of this node and all of it's children. Does not duplicate
    // RenderPrimitives, the cloned nodes will be treated as new instances of the
    // geometry.
    clone() {
        let cloneNode = new Node();
        cloneNode.name = this.name;
        cloneNode.visible = this.visible;
        cloneNode._renderer = this._renderer;

        if (this.translation) {
            cloneNode.translation = vec3.create();
            vec3.copy(cloneNode.translation, this.translation);
        }

        if (this.rotation) {
            cloneNode.rotation = quat.create();
            quat.copy(cloneNode.rotation, this.rotation);
        }

        if (this.scale) {
            cloneNode.scale = vec3.create();
            vec3.copy(cloneNode.scale, this.scale);
        }

        cloneNode._matrix = mat4.create();
        mat4.copy(cloneNode._matrix, this._matrix);

        cloneNode._worldMatrix = mat4.create();
        mat4.copy(cloneNode._worldMatrix, this._worldMatrix);

        this.waitForComplete().then(() => {
            if (this._renderPrimitives) {
                for (let primitive of this._renderPrimitives) {
                    cloneNode.addRenderPrimitive(primitive);
                }
            }

            for (let child of this.children) {
                cloneNode.addNode(child.clone());
            }
        });

        return cloneNode;
    }

    markActive(frameId) {
        if (this.visible && this._renderPrimitives) {
            this._activeFrameId = frameId;
            for (let primitive of this._renderPrimitives) {
                primitive.markActive(frameId);
            }
        }

        for (let child of this.children) {
            if (child.visible) {
                child.markActive(frameId);
            }
        }
    }

    addNode(value) {
        if (!value || value.parent == this) {
            return;
        }

        if (value.parent) {
            value.parent.removeNode(value);
        }
        value.parent = this;

        this.children.push(value);

        if (this._renderer) {
            value._setRenderer(this._renderer);
        }
    }

    removeNode(value) {
        let i = this.children.indexOf(value);
        if (i > -1) {
            this.children.splice(i, 1);
            value.parent = null;
        }
    }

    clearNodes() {
        for (let child of this.children) {
            child.parent = null;
        }
        this.children = [];
    }

    // setMatrixDirty() {
    //     if (!this._dirtyWorldMatrix) {
    //         this._dirtyWorldMatrix = true;
    //         for (let child of this.children) {
    //             child.setMatrixDirty();
    //         }
    //     }
    // }

    _updateLocalMatrix() {
        if (!this._matrix) {
            this._matrix = mat4.create();
        }

        mat4.fromRotationTranslationScale(
            this._matrix,
            this.rotation || DEFAULT_ROTATION,
            this.translation || DEFAULT_TRANSLATION,
            this.scale || DEFAULT_SCALE
        );

        return this._matrix;
    }

    set matrix(value) {
        if (value) {
            if (!this._matrix) {
                this._matrix = mat4.create();
            }
            mat4.copy(this._matrix, value);
        } else {
            this._matrix = null;
        }
        this.translation = null;
        this.rotation = null;
        this.scale = null;
    }

    get matrix() {
        return this._updateLocalMatrix();
    }

    get worldMatrix() {
        if (!this._worldMatrix) {
            this._worldMatrix = mat4.create();
        }

        if (this.parent) {
            // TODO: Some optimizations that could be done here if the node matrix
            // is an identity matrix.
            mat4.mul(this._worldMatrix, this.parent.worldMatrix, this._updateLocalMatrix());
        }

        return this._worldMatrix;
    }

    // // TODO: Decompose matrix when fetching these?
    // set translation(value: vec3) {
    //     this.translation = value;
    // }

    // get translation(): vec3 {
    //     this._dirtyTRS = true;
    //     this.setMatrixDirty();
    //     if (!this.translation) {
    //         this.translation = vec3.clone(DEFAULT_TRANSLATION);
    //     }
    //     return this.translation;
    // }

    // set rotation(value: quat) {
    //     if (value != null) {
    //         this._dirtyTRS = true;
    //         this.setMatrixDirty();
    //     }
    //     this.rotation = value;
    // }

    // get rotation(): quat {
    //     this._dirtyTRS = true;
    //     this.setMatrixDirty();
    //     if (!this.rotation) {
    //         this.rotation = quat.clone(DEFAULT_ROTATION);
    //     }
    //     return this.rotation;
    // }

    // set scale(value: vec3) {
    //     if (value != null) {
    //         this._dirtyTRS = true;
    //         this.setMatrixDirty();
    //     }
    //     this.scale = value;
    // }

    // get scale(): vec3 {
    //     this._dirtyTRS = true;
    //     this.setMatrixDirty();
    //     if (!this.scale) {
    //         this.scale = vec3.clone(DEFAULT_SCALE);
    //     }
    //     return this.scale;
    // }

    waitForComplete(): Promise<Node> {
        let childPromises: Promise<Node>[] = [];
        for (let child of this.children) {
            childPromises.push(child.waitForComplete());
        }
        if (this._renderPrimitives) {
            for (let primitive of this._renderPrimitives) {
                childPromises.push(primitive.waitForComplete());
            }
        }
        return Promise.all(childPromises).then(() => this);
    }

    get renderPrimitives() {
        return this._renderPrimitives;
    }

    addRenderPrimitive(primitive) {
        if (!this._renderPrimitives) {
            this._renderPrimitives = [primitive];
        } else {
            this._renderPrimitives.push(primitive);
        }
        primitive._instances.push(this);
    }

    removeRenderPrimitive(primitive: RenderPrimitive) {
        if (!this._renderPrimitives) {
            return;
        }

        let index = this._renderPrimitives._instances.indexOf(primitive);
        if (index > -1) {
            this._renderPrimitives._instances.splice(index, 1);

            index = primitive._instances.indexOf(this);
            if (index > -1) {
                primitive._instances.splice(index, 1);
            }

            if (!this._renderPrimitives.length) {
                this._renderPrimitives = null;
            }
        }
    }

    clearRenderPrimitives() {
        if (this._renderPrimitives) {
            for (let primitive of this._renderPrimitives) {
                let index = primitive._instances.indexOf(this);
                if (index > -1) {
                    primitive._instances.splice(index, 1);
                }
            }
            this._renderPrimitives = null;
        }
    }

    _update(timestamp, frameDelta) {
        this.onUpdate(timestamp, frameDelta);

        for (let child of this.children) {
            child._update(timestamp, frameDelta);
        }
    }

    // Called every frame so that the nodes can animate themselves
    onUpdate(timestamp, frameDelta) {}
}
