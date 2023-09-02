import {MeshNode} from '../lib/MeshNode';
import {Object3D} from '../lib/Object3D';
import {Vector3} from '../lib/Vector3';

export class knightNode extends Object3D {
    jump = 0;
    tempPos = new Vector3();
    orgPos?: Vector3;
    random: number;
    isHit = false;
    deathTimer = 1;

    constructor() {
        super();
        this.random = Math.random() * Math.PI;
    }

    hit() {
        this.children.forEach((child) => ((child as MeshNode).colorIndex = 5));
        this.isHit = true;
    }

    override update(dt: number): void {
        if (this.isHit) {
            if (this.deathTimer > 0) {
                this.deathTimer -= dt;
                if (this.deathTimer <= 0) {
                    this.active = false;
                }
            }
            return;
        }
        if (!this.orgPos) {
            this.orgPos = new Vector3(this.position.x, this.position.y, this.position.z);
        }
        this.jump += dt;
        this.tempPos.copy(this.position);
        this.tempPos.y = this.orgPos.y + Math.abs(Math.sin((this.jump + this.random) * 8) * 0.5);
        this.tempPos.x = this.orgPos.x + Math.sin(this.jump * 1) * 4;
        this.tempPos.z = this.orgPos.z + this.jump;
        this.position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z);
        //console.log(this.position);
        this.children.forEach((child) => child.update(dt));
    }
}
