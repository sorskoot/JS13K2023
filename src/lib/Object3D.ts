import {Matrix4} from './Matrix4';
import {Quaternion} from './Quaternion';
import {Renderer} from './Renderer';
import {Vector3} from './Vector3';

/**
 * Represents a node in a 3D scene graph.
 */
export class Object3D {
    name = '';
    readonly matrix = new Matrix4();
    readonly quaternion = new Quaternion(0, 0, 0, 1);
    readonly position = new Vector3(0, 0, 0);
    readonly scale = new Vector3(1, 1, 1);
    readonly children: Object3D[] = [];
    public parent: Object3D | null = null;
    public active = true;

    private _absoluteTransform: Matrix4;

    get absoluteTransform(): Matrix4 {
        if (!this.parent) return this.matrix;
        this._absoluteTransform = new Matrix4();
        this._absoluteTransform.copy(this.parent.matrix);
        this._absoluteTransform.multiply(this.matrix);

        return this._absoluteTransform;
    }

    protected renderer?: Renderer;

    constructor() {
        // this.translation = new Vector3();
        // this.rotation = new Quaternion();
        // this.scale = new Vector3(1, 1, 1);
        // this.worldMatrix = Matrix4.Identity;
        // this.localTransform = Matrix4.Identity;
        // this._absoluteTransform = Matrix4.Identity;
    }

    setRenderer(renderer: Renderer): void {
        this.renderer = renderer;
    }

    addNode(...children: Object3D[]): void {
        for (const child of children) {
            this.children.push(child);
            child.parent = this;
            child.setRenderer(this.renderer!);
        }
    }
    removeNode(index: number) {
        this.children.splice(index, 1);
    }

    updateMatrix(): void {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        for (const child of this.children) child.updateMatrix();
    }

    render2(projectionMatrix: Float32Array, transform: XRRigidTransform): ObjectData {
        let ret: ObjectData = {m: [], c: []};
        //const matrices: Matrix4[] = [];
        for (let index = 0; index < this.children.length; index++) {
            const element = this.children[index];
            const data = element.render2(projectionMatrix, transform);
            if (data) {
                ret.m.push(...data.m);
                ret.c.push(...data.c);
            }
        }
        return ret;
    }

    update(dt: number): void {}
}

export type ObjectData = {m: Matrix4[]; c: number[]};
