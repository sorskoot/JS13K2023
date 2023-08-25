import {Material} from '../lib/Material.js';
import {Matrix4} from '../lib/Matrix4.js';
import {Mesh} from '../lib/Mesh.js';
import {MeshNode} from '../lib/MeshNode.js';
import {Object3D} from '../lib/Object3D.js';
import {Quaternion} from '../lib/Quaternion.js';
import {Vector3} from '../lib/Vector3.js';

const G = 9.8; // m/s^2

/**
 * Represents a bow object that can be used to fire arrows.
 */
export class Bow {
    // The position and orientation of the bow hand.
    private bowHandPosition: Vector3;
    private bowHandOrientation: Quaternion;

    // The position of the arrow hand.
    private arrowHandPosition: Vector3;
    private arrowHandOrientation: Quaternion;
    // The current state of the bow (e.g., DRAWN or IDLE)
    public state: State;
    public readyToDraw: boolean = false;
    public drawDistance: number = 0;

    // Force multiplier for drawing the bow.
    DRAW_FORCE_MULTIPLIER = 10;

    constructor() {
        this.state = State.IDLE;
        this.bowHandPosition = new Vector3(0, 0, 0);
        this.arrowHandPosition = new Vector3(0, 0, 0);
    }

    /**
     * Updates the state of the bow based on the current hand positions.
     * @param bowHandState The state of the hand holding the bow.
     * @param arrowHandState The state of the hand holding the arrow.
     */
    update(
        bowHandState: HandState,
        arrowHandState: HandState,
        stringCenter: Object3D,
        stringMin: Object3D,
        stringMax: Object3D
    ) {
        // Update hand positions based on controller input.
        this.bowHandPosition = bowHandState.position;
        this.bowHandOrientation = bowHandState.orientation;

        this.arrowHandPosition = arrowHandState.position;
        this.arrowHandOrientation = arrowHandState.orientation;

        const stringCenterWorld = stringCenter.absoluteTransform.toVector3();

        if (this.arrowHandPosition.distanceTo(stringCenterWorld) < 0.05) {
            this.readyToDraw = true;
        } else {
            this.readyToDraw = false;
        }
        switch (this.state) {
            case State.IDLE:
                if (arrowHandState.isGripping && this.readyToDraw) {
                    this.state = State.DRAWN;
                }
                break;

            case State.DRAWN:
                if (!arrowHandState.isGripping) {
                    this.state = State.IDLE;

                    // Calculate direction and force
                    let direction = calculateDirection(
                        this.bowHandPosition,
                        this.arrowHandPosition,
                        this.bowHandOrientation
                    );

                    let force =
                        calculateForce(this.bowHandPosition, this.arrowHandPosition) *
                        this.DRAW_FORCE_MULTIPLIER;

                    fireArrow(direction, force);
                    this.drawDistance = 0;
                } else {
                    // If still gripping update string center

                    // Your 3 vectors
                    const v1 = stringMin.absoluteTransform.toVector3();
                    const v2 = stringMax.absoluteTransform.toVector3();
                    const p = arrowHandState.position;

                    // Calculate direction vector d
                    const d = new Vector3();
                    d.copy(v2).sub(v1);

                    // Calculate vector difference between p and v1
                    const pv = new Vector3();
                    pv.copy(p).sub(v1);

                    // Scalar projection formula: (pv . d) / ||d||^2 which gives us t.
                    // If t<0 => closest is v1; if t>1 => closest is v2; else closest is on the line
                    let t = pv.dot(d) / (d.getLength() * d.getLength());
                    t = Math.max(0, Math.min(1, t));

                    // Closest point calculation
                    const closestPointOnLine = new Vector3();
                    closestPointOnLine.copy(v1).lerp(v2, t);

                    this.drawDistance = closestPointOnLine.distanceTo(v1);
                }

                break;
        }
    }
}

function calculateDirection(
    bowPos: Vector3,
    arrowPos: Vector3,
    orientation: Quaternion
): Vector3 {
    // do calculation:
    return new Vector3(0, 0, 0);
}

function calculateForce(bowPos: Vector3, arrowPos: Vector3): number {
    // d0 calculation
    return 0;
}

function fireArrow(direction: Vector3, force: number) {
    // TODO: implement
    console.log('Firing arrow with direction: ' + direction + ' and force: ' + force);
}

export enum State {
    IDLE,
    DRAWN,
}

/**
 * Represents the state of a hand in 3D space, including its position, orientation, and whether it is gripping something.
 */
export interface HandState {
    position: Vector3;
    orientation: Quaternion;
    isGripping: boolean;
}

enum ArrowState {
    HELD,
    IN_FLIGHT,
    HIT_TARGET,
}

export class Arrow {
    // The current state of the arrow.
    private state: ArrowState;

    // Position and velocity of the arrow.
    private position: Vector3;
    private velocity: Vector3;

    constructor() {
        this.state = ArrowState.HELD;
        this.position = new Vector3(0, 0, 0);
        this.velocity = new Vector3(0, 0, 0);
    }

    update(dt: number) {
        switch (this.state) {
            case ArrowState.HELD:
                // If held, position should be updated to match hand position
                break;

            case ArrowState.IN_FLIGHT:
                // If in flight, update based on physics
                this.position.x += this.velocity.x * dt;
                this.position.y += this.velocity.y * dt - 0.5 * G * dt * dt; // subtract gravity
                this.position.z += this.velocity.z * dt;

                // Check for collision with enemy here and if so set state to HIT_TARGET

                break;

            case ArrowState.HIT_TARGET:
                // Handle logic after hitting a target e.g., play sound effect or animation etc.

                break;
        }
    }

    fire(direction: Vector3, force: number) {
        // Set velocity based on direction and force
        // then change state to IN_FLIGHT

        this.velocity.x = direction.x * force;
        this.velocity.y = direction.y * force;
        this.velocity.z = direction.z * force;

        this.state = ArrowState.IN_FLIGHT;
    }
}

export class StringPart extends MeshNode {
    constructor(mesh: Mesh, material: Material) {
        super(mesh, material);
    }

    recalculate(node1: Object3D, node2: Object3D) {
        // update position, rotation and scale to create a line between the 2 nodes
        const posA = node1.position;
        const posB = node2.position;

        const diff = new Vector3();
        diff.copy(posB);
        diff.sub(posA);
        diff.multiply(0.5);
        const dist = diff.getLength();

        this.scale.set(0.003, 0.003, dist);
        this.position.copy(diff);
        this.position.add(posA);

        const dir = new Vector3();
        dir.copy(diff).normalize();
        const q = new Quaternion();
        this.quaternion.rotationTo(new Vector3(0, 0, 1), dir);
    }
    /*
    update: function(dt) {
        this.targetA.getTranslationWorld(this.posA);
        this.targetB.getTranslationWorld(this.posB);
        glMatrix.vec3.sub(this.diff, this.posB, this.posA);
        glMatrix.vec3.scale(this.diff, this.diff, 0.5);

        let dist = glMatrix.vec3.length(this.diff);
        this.object.resetTransform();
        this.object.scale([this.thickness, this.lengthPercentage*dist, this.thickness]);

        glMatrix.quat2.conjugate(this.invParent, this.object.parent.transformWorld);

        glMatrix.vec3.normalize(this.dir, this.diff);
        glMatrix.quat.rotationTo(this.object.transformLocal, [0, 1, 0], this.dir);
        glMatrix.vec3.add(this.diff, this.posA, this.diff);
        this.object.translate(this.diff);

        glMatrix.quat2.mul(this.object.transformLocal, this.invParent, this.object.transformLocal);
    },   
*/
}
