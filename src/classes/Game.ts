import {GL} from '../lib/GL';
import {Renderer} from '../lib/Renderer';
import {Material} from '../lib/Material';
import {Mesh} from '../lib/Mesh';
import {Scene} from '../lib/Scene';
import {MeshNode} from '../lib/MeshNode';
import {cube} from './Consts';
import {Object3D} from '../lib/Object3D';
import {BowModel} from './Models';
import {Bow, State, StringPart} from './Bow';
import {Controller} from './Controller';
import {Vector3} from '../lib/Vector3';

/**
 * Represents the game object.
 */
export class Game {
    // XR globals.
    xrButton!: HTMLButtonElement;
    xrRefSpace!: XRReferenceSpace | XRBoundedReferenceSpace;
    xrSession!: XRSession;
    gl!: WebGL2RenderingContext;
    renderer!: Renderer;
    planeMesh!: Mesh;
    planeMaterial!: Material;
    cubeMesh!: Mesh;
    cubeMaterial!: Material;
    cube!: MeshNode;
    scene!: Scene;
    bow: Bow;
    stringPart1: StringPart;
    stringPart2: StringPart;
    handRm: any;
    placedArrow: MeshNode;
    arrowMat: Material;
    arrowMesh: Mesh;

    constructor() {
        console.log('Game started');
        this.initXR();
    }

    /**
     * Checks to see if WebXR is available and, if so, queries a list of
     * XRDevices that are connected to the system.
     */
    initXR() {
        // Adds a helper button to the page that indicates if any XRDevices are
        // available and let's the user pick between them if there's multiple.
        this.xrButton = document.getElementById('xr-button') as HTMLButtonElement;
        this.xrButton.addEventListener('click', this.onRequestSession.bind(this));

        // Is WebXR available on this UA?
        if (navigator.xr) {
            // If the device allows creation of exclusive sessions set it as the
            // target of the 'Enter XR' button.
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                this.xrButton.disabled = !supported;
            });
        }
    }

    /**
     *  Called when the user selects a device to present to. In response we
     * will request an exclusive session from that device.
     */
    onRequestSession() {
        return navigator
            .xr!.requestSession('immersive-vr')
            .then(this.onSessionStarted.bind(this));
    }

    /**
     * Called when we've successfully acquired a XRSession. In response we
     * will set up the necessary session state and kick off the frame loop.
     */
    onSessionStarted(session: XRSession) {
        // This informs the 'Enter XR' button that the session has started and
        // that it should display 'Exit XR' instead.
        //xrButton.setSession(session);
        // Listen for the sessions 'end' event so we can respond if the user
        // or UA ends the session for any reason.
        session.addEventListener('end', this.onSessionEnded.bind(this));

        let webglCanvas = document.createElement('canvas');
        // Create a WebGL context to render with, initialized to be compatible
        // with the XRDisplay we're presenting to.
        this.gl = webglCanvas.getContext('webgl2', {
            xrCompatible: true,
            alpha: false,
        })!;

        this.xrSession = session; // we set our session to be the session our request created
        this.xrSession.addEventListener('end', this.onSessionEnded.bind(this)); // we set what happenes when our session is ended

        this.xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(this.xrSession, this.gl),
        }); // this line simply sets our session's WebGL context to our WebGL2 context

        this.renderer = new Renderer(this.gl);
        this.renderer.depthTesting(true); // if you don't know what that means - it means that our meshes will be rendered properly ¯\_(ツ)_/¯

        this.scene = new Scene(this.renderer);

        this.planeMesh = new Mesh(this.gl);
        this.planeMesh.loadFromData([
            10, 0, 10, 5.5, -4.5, 0, 1, 0, -10, 0, -10, -4.5, 5.5, 0, 1, 0, -10, 0, 10,
            -4.5, -4.5, 0, 1, 0, 10, 0, 10, 5.5, -4.5, 0, 1, 0, 10, 0, -10, 5.5, 5.5, 0, 1,
            0, -10, 0, -10, -4.5, 5.5, 0, 1, 0,
        ]);

        this.planeMaterial = new Material(this.gl);
        this.scene.addNode(new MeshNode(this.planeMesh, this.planeMaterial));

        this.planeMaterial.setColor([0.0, 0.5, 0.2, 1]);

        this.cubeMesh = new Mesh(this.gl);
        this.cubeMesh.loadFromData(cube);
        this.cubeMaterial = new Material(this.gl);

        this.cubeMaterial.setColor([1, 0.0, 0.0, 1]);
        this.cube = new MeshNode(this.cubeMesh, this.cubeMaterial);
        this.cube.position.set(0, 1, -2);
        this.cube.scale.set(0.25, 0.25, 0.25);
        this.cube.quaternion.fromEuler(0, 0, 0);
        this.scene.addNode(this.cube);

        const handL = new Mesh(this.gl);
        handL.loadFromData(cube);
        const handm = new Material(this.gl);
        handm.setColor([0.0, 0.0, 1.0, 1]);
        const handR = new Mesh(this.gl);
        handR.loadFromData(cube);
        this.handRm = new Material(this.gl);
        this.handRm.setColor([0.0, 0.0, 1.0, 1]);

        this.scene.leftHand = new Controller('left');
        this.scene.leftHand.setRenderer(this.renderer);

        let nodes = this.getModel(BowModel, handL, handm);

        this.scene.rightHand = new Controller('right');
        this.scene.rightHand.setRenderer(this.renderer);
        const rightHandMesh = new MeshNode(handR, this.handRm);
        rightHandMesh.scale.set(0.01, 0.01, 0.01);
        this.scene.rightHand.addNode(rightHandMesh);

        this.bow = new Bow();

        const stringM = new Material(this.gl);
        stringM.setColor([0.8, 0.8, 0.8, 1]);
        this.stringPart1 = new StringPart(handL, stringM);
        this.stringPart1.scale.set(0.01, 0.01, 0.01);

        this.stringPart2 = new StringPart(handL, stringM);
        this.stringPart2.scale.set(0.01, 0.01, 0.01);

        this.arrowMesh = new Mesh(this.gl);
        this.arrowMat = new Material(this.gl);
        this.arrowMat.setColor([0.5, 0.35, 0.2, 1]);
        this.placedArrow = new MeshNode(handL, this.arrowMat);
        this.placedArrow.scale.set(0.005, 0.4, 0.005);
        this.placedArrow.position.set(0, -0.4 + 0.19, 0);

        this.scene.leftHand.addNode(
            ...nodes,
            this.stringPart1,
            this.stringPart2,
            this.placedArrow
        );

        this.scene.rightHand.onTrigger.on((value) => {
            if (value) {
                this.handRm.setColor([1.0, 0.0, 0.0, 1]);
            } else {
                this.handRm.setColor([0.0, 0.0, 1.0, 1]);
            }
        });

        session.updateRenderState({baseLayer: new XRWebGLLayer(session, this.gl)});

        session.requestReferenceSpace('local').then((refSpace) => {
            // make sure the camera starts 1.6m below the floor level
            const xform = new XRRigidTransform({y: -1.6});
            this.xrRefSpace = refSpace.getOffsetReferenceSpace(xform);

            session.requestAnimationFrame(this.onXRFrame.bind(this));
        });
    }

    /**
     * Called either when the user has explicitly ended the session (like in
     * onEndSession()) or when the UA has ended the session for any reason.
     * At this point the session object is no longer usable and should be
     * discarded.
     * @param event The event that caused the session to end.
     */
    onSessionEnded(event) {
        //xrButton.setSession(null);
        // In this simple case discard the WebGL context too, since we're not
        // rendering anything else to the screen with it.
        // renderer = null;
    }

    ang = 0;
    prev = 0;
    /**
     * Called every time the XRSession requests that a new frame be drawn.
     */
    onXRFrame(t: DOMHighResTimeStamp, frame: XRFrame) {
        let session = frame.session;

        // Per-frame scene setup. Nothing WebXR specific here.
        //scene.startFrame();
        // Inform the session that we're ready for the next frame.
        session.requestAnimationFrame(this.onXRFrame.bind(this));

        // Get the XRDevice pose relative to the Frame of Reference we created
        // earlier.
        let pose = frame.getViewerPose(this.xrRefSpace);

        this.scene.updateMatrix();

        this.ang += (t - this.prev) / 2500;
        this.prev = t;
        this.cube.quaternion.fromEuler(0, this.ang, 0);

        // Getting the pose may fail if, for example, tracking is lost. So we
        // have to check to make sure that we got a valid pose before attempting
        // to render with it. If not in this case we'll just leave the
        // framebuffer cleared, so tracking loss means the scene will simply
        // disappear.
        if (pose) {
            let glLayer = session.renderState.baseLayer!;

            // If we do have a valid pose, bind the WebGL layer's framebuffer,
            // which is where any content to be displayed on the XRDevice must be
            // rendered.
            this.gl.bindFramebuffer(GL.FRAMEBUFFER, glLayer.framebuffer);

            // Clear the framebuffer
            this.gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

            this.renderer.clear([0.5, 0.8, 1, 1]);

            this.scene.updateInputSources(frame, this.xrRefSpace);

            this.bow.update(
                {
                    orientation: this.scene.leftHand.quaternion,
                    position: this.scene.leftHand.position,
                    isGripping: this.scene.leftHand.triggerPressed,
                },
                {
                    orientation: this.scene.rightHand.quaternion,
                    position: this.scene.rightHand.position,
                    isGripping: this.scene.rightHand.triggerPressed,
                },
                this.scene.leftHand.children[7],
                this.scene.leftHand.children[8],
                this.scene.leftHand.children[9]
            );

            this.stringPart1.recalculate(
                this.scene.leftHand.children[5],
                this.scene.leftHand.children[7]
            );
            this.stringPart2.recalculate(
                this.scene.leftHand.children[6],
                this.scene.leftHand.children[7]
            );

            if (this.bow.readyToDraw) {
                this.handRm.setColor([0.0, 1.0, 0.0, 1]);
            } else {
                this.handRm.setColor([0.0, 0.0, 1.0, 1]);
            }

            if (this.bow.state == State.DRAWN) {
                this.placedArrow!.position.set(0, -0.4 + 0.19 + this.bow.drawDistance, 0);
                this.placedArrow!.active = true;
            } else if (this.bow.state == State.IDLE) {
                this.placedArrow!.active = false;
                //this.placedArrow = null;
                //this.scene.leftHand.removeNode(12);
            }

            this.scene.leftHand.children[7].position.set(
                0,
                0.19 + this.bow.drawDistance,
                0
            );

            // Loop through each of the views reported by the frame and draw them
            // into the corresponding viewport.
            for (let view of pose.views) {
                let viewport = glLayer.getViewport(view)!;
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                this.scene.render(view.projectionMatrix, view.transform);
            }
        }

        // Per-frame scene teardown. Nothing WebXR specific here.
        //scene.endFrame();
    }

    getModel(model: number[][][], mesh: Mesh, material: Material) {
        return model.map((props) => {
            const node = new MeshNode(mesh, material);
            node.scale.set(...props[1]);
            node.position.set(...props[0]);
            node.quaternion.fromEuler(...props[2]);
            return node;
        });
    }
}
