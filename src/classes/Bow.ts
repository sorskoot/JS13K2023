import {Material} from '../lib/Material.js';
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
    private state: State;

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
    update(bowHandState: HandState, arrowHandState: HandState) {
        // Update hand positions based on controller input.
        this.bowHandPosition = bowHandState.position;
        this.bowHandOrientation = bowHandState.orientation;

        switch (this.state) {
            case State.IDLE:
                if (arrowHandState.isGripping) {
                    this.state = State.DRAWN;
                    this.arrowHandPosition = arrowHandState.position;
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
                } else {
                    // If still gripping update the arrow hand position for next calculations
                    this.arrowHandPosition = arrowHandState.position;
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
