import {EventEmitter} from '../lib/EventEmitter.js';
import {MeshNode} from '../lib/MeshNode.js';
import {Object3D} from '../lib/Object3D.js';
import {Quaternion} from '../lib/Quaternion.js';
import {Vector3} from '../lib/Vector3.js';

/**
 * Represents a bow object that can be used to fire arrows.
 */
export class Bow {
    // The position and orientation of the bow hand.
    private bowHandPosition: Vector3;
    private bowHandOrientation: Quaternion;

    // The position of the arrow hand.
    private arrowHandPosition: Vector3;
    // The current state of the bow (e.g., DRAWN or IDLE)
    public state: State;
    public readyToDraw: boolean = false;
    public drawDistance: number = 0;

    public onFire: EventEmitter<ArrowData> = new EventEmitter();

    // Force multiplier for drawing the bow.
    DRAW_FORCE_MULTIPLIER = 65;

    constructor() {
        this.state = State.IDLE;
        this.bowHandPosition = new Vector3(0, 0, 0);
        this.bowHandOrientation = new Quaternion(0, 0, 0, 1);
        this.arrowHandPosition = new Vector3(0, 0, 0);
    }

    tempStringCenter = new Vector3();
    tempVec1 = new Vector3();
    tempVec2 = new Vector3();
    tempDir = new Vector3();
    tempPV = new Vector3();
    tempClosestPoint = new Vector3();

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

        stringCenter.absoluteTransform.toVector3(this.tempStringCenter);

        if (this.arrowHandPosition.distanceTo(this.tempStringCenter) < 0.05) {
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
                    if (this.drawDistance < 0.1) {
                        this.drawDistance = 0;
                        return;
                    }
                    // Calculate direction and force
                    let direction = this.calculateDirection(this.bowHandOrientation);
                    let force = this.drawDistance * this.DRAW_FORCE_MULTIPLIER;

                    this.fireArrow(this.bowHandPosition, this.bowHandOrientation, direction, force);
                    this.drawDistance = 0;
                } else {
                    // If still gripping update string center

                    // Your 3 vectors
                    stringMin.absoluteTransform.toVector3(this.tempVec1);
                    stringMax.absoluteTransform.toVector3(this.tempVec2);
                    const p = arrowHandState.position;

                    // Calculate direction vector d
                    this.tempDir.copy(this.tempVec2).sub(this.tempVec1);

                    // Calculate vector difference between p and v1
                    this.tempPV.copy(p).sub(this.tempVec1);

                    // Scalar projection formula: (pv . d) / ||d||^2 which gives us t.
                    // If t<0 => closest is v1; if t>1 => closest is v2; else closest is on the line
                    let t = this.tempPV.dot(this.tempDir) / (this.tempDir.getLength() * this.tempDir.getLength());
                    t = Math.max(0, Math.min(1, t));

                    // Closest point calculation
                    this.tempClosestPoint.copy(this.tempVec1).lerp(this.tempVec2, t);

                    this.drawDistance = this.tempClosestPoint.distanceTo(this.tempVec1);
                }

                break;
        }
    }

    calculateDirection(orientation: Quaternion): Vector3 {
        // Return forward vector of bow orientation
        const forward = new Vector3(0, -1, 0);
        forward.applyQuaternion(orientation);
        return forward;
    }

    calculateForce(bowPos: Vector3, arrowPos: Vector3): number {
        // d0 calculation
        return 0;
    }

    fireArrow(position: Vector3, orientation: Quaternion, direction: Vector3, force: number) {
        this.onFire.emit(new ArrowData(position, orientation, direction, force));
    }
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

export enum ArrowState {
    HELD,
    IN_FLIGHT,
    HIT_TARGET,
}

export class ArrowData {
    position: Vector3;
    orientation: Quaternion;
    direction: Vector3;
    force: number;
    constructor(position: Vector3, orientation: Quaternion, direction: Vector3, force: number) {
        this.position = position;
        this.orientation = orientation;
        this.direction = direction;
        this.force = force;
    }
}
const up = new Vector3(0, -1, 0);
export class Arrow extends MeshNode {
    velocity: Vector3;

    constructor(arrowMat: number) {
        super(arrowMat);
        this.isStatic = false;
        this.scale.set(0.005, 0.005, 0.4);
        this.position.set(0, -0.4 + 0.19, 0);
        this.velocity = new Vector3(0, 0, 0);
    }
    tempVector = new Vector3();
    override update(dt: number) {
        this.tempVector.copy(this.position);
        this.velocity.y -= 9.8 * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;

        this.quaternion.lookAt(this.tempVector, this.position, up);

        if (this.position.y < -5) {
            this.active = false;
        }
    }
}

export class StringPart extends MeshNode {
    constructor(colorIndex: number) {
        super(colorIndex);
        this.isStatic = false;
    }

    tempDiffVector = new Vector3();
    tempDirVector = new Vector3();

    recalculate(node1: Object3D, node2: Object3D) {
        // update position, rotation and scale to create a line between the 2 nodes
        const posA = node1.position;
        const posB = node2.position;

        this.tempDiffVector.copy(posB);
        this.tempDiffVector.sub(posA);
        this.tempDiffVector.multiply(0.5);
        const dist = this.tempDiffVector.getLength();

        this.scale.set(0.003, 0.003, dist);
        this.position.copy(this.tempDiffVector);
        this.position.add(posA);

        this.tempDirVector.copy(this.tempDiffVector).normalize();

        this.quaternion.rotationTo(new Vector3(0, 0, 1), this.tempDirVector);
    }
}
