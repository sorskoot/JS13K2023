import {MeshNode} from '../lib/MeshNode';
import {Object3D} from '../lib/Object3D';
import {Vector3} from '../lib/Vector3';
import {paletteIndex} from './Consts';

const NUM_OF_PARTICLES = 40;
const tempVec = new Vector3();

export class Explosion extends Object3D {
    lifetime = 2;
    velocities: Vector3[] = [];
    constructor() {
        super();
    }

    initialize(): void {
        //add 20 cubes as children
        const cubes: Object3D[] = [];

        for (let i = 0; i < NUM_OF_PARTICLES; i++) {
            const node = new MeshNode(paletteIndex.red);
            const s = Math.random() * 0.1 + 0.1;
            node.scale.set(s, s, s);
            node.position.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5);
            cubes.push(node);

            this.velocities.push(new Vector3((Math.random() - 0.5) * 3, Math.random() * 5, (Math.random() - 0.5) * 3));
        }
        this.addNode(...cubes);
    }

    override update(delta: number): void {
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.active = false;
        }
        for (let i = 0; i < NUM_OF_PARTICLES; i++) {
            this.velocities[i].y -= 9.8 * delta;
            this.children[i].position.x += this.velocities[i].x * delta;
            this.children[i].position.y += this.velocities[i].y * delta;
            this.children[i].position.z += this.velocities[i].z * delta;
        }
    }
}
