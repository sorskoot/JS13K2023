import {RenderView} from '../core/renderer.js';
//import {StatsViewer} from '../nodes/stats-viewer.js';
import {Node} from '../core/node.js';

export class WebXRView extends RenderView {
    constructor(view, layer, viewport) {
        super(
            view ? view.projectionMatrix : null,
            view ? view.transform : null,
            null,
            //viewport ? viewport : layer && view ? layer.getViewport(view) : null,
            view ? view.eye : 'left'
        );
    }
}

export class Scene extends Node {
    _timestamp: number;
    _frameDelta: number;
    _statsStanding: boolean;
    _stats: null;
    _statsEnabled: boolean;
    _resetInputEndFrame: boolean;
    _lastTimestamp: number;
    _hoverFrame: number;
    _hoveredNodes: never[];
    clear: boolean;
    _renderer: any;

    constructor() {
        super();

        this._timestamp = -1;
        this._frameDelta = 0;
        this._statsStanding = false;
        this._stats = null;
        this._statsEnabled = false;
        //this.enableStats(true); // Ensure the stats are added correctly by default.

        // this._inputRenderer = null;
        this._resetInputEndFrame = true;

        this._lastTimestamp = 0;

        this._hoverFrame = 0;
        this._hoveredNodes = [];

        this.clear = true;
    }

    setRenderer(renderer) {
        super._setRenderer(renderer);
    }

    loseRenderer() {
        if (this._renderer) {
            this._stats = null;
            this._renderer = null;
            //this._inputRenderer = null;
        }
    }

    // get inputRenderer() {
    //     if (!this._inputRenderer) {
    //         this._inputRenderer = new InputRenderer();
    //         this.addNode(this._inputRenderer);
    //     }
    //     return this._inputRenderer;
    // }

    // Helper function that automatically adds the appropriate visual elements for
    // all input sources.
    // updateInputSources(frame, refSpace) {
    //     let newHoveredNodes = [];
    //     let lastHoverFrame = this._hoverFrame;
    //     this._hoverFrame++;

    //     for (let inputSource of frame.session.inputSources) {
    //         let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);

    //         if (!targetRayPose) {
    //             continue;
    //         }

    //         // if (inputSource.targetRayMode == 'tracked-pointer') {
    //         //     // If we have a pointer matrix and the pointer origin is the users
    //         //     // hand (as opposed to their head or the screen) use it to render
    //         //     // a ray coming out of the input device to indicate the pointer
    //         //     // direction.
    //         //     this.inputRenderer.addLaserPointer(targetRayPose.transform);
    //         // }

    //         // If we have a pointer matrix we can also use it to render a cursor
    //         // for both handheld and gaze-based input sources.

    //         // Check and see if the pointer is pointing at any selectable objects.
    //         let hitResult = this.hitTest(targetRayPose.transform);

    //         if (hitResult) {
    //             // Render a cursor at the intersection point.
    //             //  this.inputRenderer.addCursor(hitResult.intersection);

    //             if (hitResult.node._hoverFrameId != lastHoverFrame) {
    //                 hitResult.node.onHoverStart();
    //             }
    //             hitResult.node._hoverFrameId = this._hoverFrame;
    //             newHoveredNodes.push(hitResult.node);
    //         } else {
    //             // Statically render the cursor 1 meters down the ray since we didn't
    //             // hit anything selectable.
    //             let targetRay = new Ray(targetRayPose.transform.matrix);
    //             let cursorDistance = 1.0;
    //             let cursorPos = vec3.fromValues(
    //                 targetRay.origin[0], //x
    //                 targetRay.origin[1], //y
    //                 targetRay.origin[2] //z
    //             );
    //             vec3.add(cursorPos, cursorPos, [
    //                 targetRay.direction[0] * cursorDistance,
    //                 targetRay.direction[1] * cursorDistance,
    //                 targetRay.direction[2] * cursorDistance,
    //             ]);
    //             // let cursorPos = vec3.fromValues(0, 0, -1.0);
    //             // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay);
    //             // this.inputRenderer.addCursor(cursorPos);
    //         }

    //         if (inputSource.gripSpace) {
    //             let gripPose = frame.getPose(inputSource.gripSpace, refSpace);

    //             // Any time that we have a grip matrix, we'll render a controller.
    //             if (gripPose) {
    //                 // this.inputRenderer.addController(
    //                 //     gripPose.transform.matrix,
    //                 //     inputSource.handedness
    //                 // );
    //             }
    //         }
    //     }

    //     for (let hoverNode of this._hoveredNodes) {
    //         if (hoverNode._hoverFrameId != this._hoverFrame) {
    //             hoverNode.onHoverEnd();
    //         }
    //     }

    //     this._hoveredNodes = newHoveredNodes;
    // }
    // hitTest(transform: any) {
    //     throw new Error('Method not implemented.');
    // }

    // handleSelect(inputSource, frame, refSpace) {
    //     let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);

    //     if (!targetRayPose) {
    //         return;
    //     }

    //     this.handleSelectPointer(targetRayPose.transform);
    // }

    // handleSelectPointer(rigidTransform) {
    //     if (rigidTransform) {
    //         // Check and see if the pointer is pointing at any selectable objects.
    //         let hitResult = this.hitTest(rigidTransform);

    //         if (hitResult) {
    //             // Render a cursor at the intersection point.
    //             hitResult.node.handleSelect();
    //         }
    //     }
    // }

    // enableStats(enable) {
    //     if (enable == this._statsEnabled) {
    //         return;
    //     }

    //     this._statsEnabled = enable;

    //     if (enable) {
    //         this._stats = new StatsViewer();
    //         this._stats.selectable = true;
    //         this.addNode(this._stats);

    //         if (this._statsStanding) {
    //             this._stats.translation = [0, 1.4, -0.75];
    //         } else {
    //             this._stats.translation = [0, -0.3, -0.5];
    //         }
    //         this._stats.scale = [0.3, 0.3, 0.3];
    //         quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    //     } else if (!enable) {
    //         if (this._stats) {
    //             this.removeNode(this._stats);
    //             this._stats = null;
    //         }
    //     }
    // }
    // addNode(_stats: any) {
    //     throw new Error('Method not implemented.');
    // }
    // removeNode(_stats: any) {
    //     throw new Error('Method not implemented.');
    // }

    // standingStats(enable) {
    //     this._statsStanding = enable;
    //     if (this._stats) {
    //         if (this._statsStanding) {
    //             this._stats.translation = [0, 1.4, -0.75];
    //         } else {
    //             this._stats.translation = [0, -0.3, -0.5];
    //         }
    //         this._stats.scale = [0.3, 0.3, 0.3];
    //         quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
    //     }
    // }

    draw(projectionMatrix, viewTransform, eye = null) {
        let view = new RenderView(projectionMatrix, viewTransform);
        if (eye) {
            view.eye = eye;
        }

        this.drawViewArray([view]);
    }

    /** Draws the scene into the base layer of the XRFrame's session */
    drawXRFrame(xrFrame, pose) {
        if (!this._renderer || !pose) {
            return;
        }

        let gl = this._renderer.gl;
        let session = xrFrame.session;
        // Assumed to be a XRWebGLLayer for now.
        let layer = session.renderState.baseLayer;
        if (!layer) layer = session.renderState.layers[0];
        else {
            // only baseLayer has framebuffer and we need to bind it
            // even if it is null (for inline sessions)
            gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        }

        if (!gl) {
            return;
        }

        if (this.clear) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        let views: RenderView[] = [];
        for (let view of pose.views) {
            views.push(new WebXRView(view, layer, null));
        }

        this.drawViewArray(views);
    }

    drawViewArray(views) {
        // Don't draw when we don't have a valid context
        if (!this._renderer) {
            return;
        }

        this._renderer.drawViews(views, this);
    }

    startFrame() {
        let prevTimestamp = this._timestamp;
        this._timestamp = performance.now();
        // if (this._stats) {
        //     this._stats.begin();
        // }

        if (prevTimestamp >= 0) {
            this._frameDelta = this._timestamp - prevTimestamp;
        } else {
            this._frameDelta = 0;
        }

        super._update(this._timestamp, this._frameDelta);

        return this._frameDelta;
    }

    endFrame() {
        // if (this._inputRenderer && this._resetInputEndFrame) {
        //     this._inputRenderer.reset();
        // }
        // if (this._stats) {
        //     this._stats.end();
        // }
    }

    // Override to load scene resources on construction or context restore.
    onLoadScene(renderer) {
        return Promise.resolve();
    }
}
