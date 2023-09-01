import {Object3D, ObjectData} from './Object3D';

export class MeshNode extends Object3D {
    colorIndex: number = 0;

    constructor(colorIndex: number) {
        super();
        this.name = 'mesh';
        this.colorIndex = colorIndex;
    }

    override render2(projectionMatrix: Float32Array, transform: XRRigidTransform): ObjectData {
        const ret: ObjectData = {m: [], c: []};
        ret.m = [this.absoluteTransform];
        ret.c = [this.colorIndex];
        this.children?.forEach((child) => {
            const data = child.render2(projectionMatrix, transform);
            ret.m.push(...data.m);
            ret.c.push(...data.c);
        });
        return ret;
    }
}
