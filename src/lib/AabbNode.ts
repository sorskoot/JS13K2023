import {Object3D} from './Object3D';
import {Vector3} from './Vector3';

/**
 * Represents an axis-aligned bounding box node in 3D space used for collision detection.
 */
export class AabbNode extends Object3D {
    public readonly min: Vector3;
    public readonly max: Vector3;
    public readonly group: number;

    private minWorld: Vector3;
    private maxWorld: Vector3;

    constructor(min: Vector3, max: Vector3, group: number = 0xff) {
        super();
        this.min = min;
        this.max = max;
        this.group = group;
        this.minWorld = new Vector3();
        this.maxWorld = new Vector3();
    }

    override update(dt: number): void {
        this.minWorld.copy(this.min).add(this.position);
        this.maxWorld.copy(this.max).add(this.position);
    }

    intersect(other: AabbNode): boolean {
        return (
            this.minWorld.x <= other.maxWorld.x &&
            this.maxWorld.x >= other.minWorld.x &&
            this.minWorld.y <= other.maxWorld.y &&
            this.maxWorld.y >= other.minWorld.y &&
            this.minWorld.z <= other.maxWorld.z &&
            this.maxWorld.z >= other.minWorld.z
        );
    }
}
