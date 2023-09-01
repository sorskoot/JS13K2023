import {GL} from '../lib/GL';
import {Renderer} from '../lib/Renderer';
import {Scene} from './Scene';
import {MeshNode} from '../lib/MeshNode';
import {cube, paletteIndex} from './Consts';
import {Object3D} from '../lib/Object3D';
import {BowModel, EnemyModel, TowerModel} from './Models';
import {Arrow, ArrowData, Bow, State, StringPart} from './Bow';
import {Controller} from './Controller';

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
    cube!: Object3D;
    scene!: Scene;
    bow: Bow;
    stringPart1: StringPart;
    stringPart2: StringPart;
    //handRm: any;
    placedArrow: MeshNode;
    //arrowMesh: Mesh;
    arrowList: Arrow[] = [];

    army: MeshNode[] = [];
    battlefield: Object3D;

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
        return navigator.xr!.requestSession('immersive-vr').then(this.onSessionStarted.bind(this));
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

        const ground = new MeshNode(paletteIndex.green);
        ground.scale.set(50, 0.1, 50);
        ground.position.set(0, -5, 0);
        this.scene.addNode(ground);

        this.battlefield = new Object3D();
        this.battlefield.name = 'battlefield';
        this.battlefield.position.set(0, -5, 0);
        this.scene.addNode(this.battlefield);

        //this.cubeMaterial.setColor([1, 0.0, 0.0, 1]);
        for (let j = 0; j < 25; j++) {
            for (let i = 0; i < 10; i++) {
                let cube = new Object3D();
                this.battlefield.addNode(cube);

                let man = this.getModel(EnemyModel);
                cube.addNode(...man);
                cube.scale.set(0.15, 0.15, 0.15);
                cube.position.set(10 - i * 2, 0.25 - 5, -8 - j * 2);
            }
        }

        this.scene.leftHand = new Controller('left');
        this.scene.leftHand.setRenderer(this.renderer);

        let nodes = this.getModel(BowModel);

        this.scene.rightHand = new Controller('right');
        this.scene.rightHand.setRenderer(this.renderer);
        const rightHandMesh = new MeshNode(paletteIndex.orange);
        rightHandMesh.scale.set(0.01, 0.01, 0.01);
        this.scene.rightHand.addNode(rightHandMesh);

        this.bow = new Bow();
        this.bow.onFire.on((arrow) => this.spawnArrow(arrow));

        this.stringPart1 = new StringPart(paletteIndex.black);
        this.stringPart1.scale.set(0.003, 0.003, 0.1);

        this.stringPart2 = new StringPart(paletteIndex.black);
        this.stringPart2.scale.set(0.003, 0.003, 0.1);

        // this.arrowMesh = new Mesh(this.gl);
        // this.arrowMesh.loadFromData(cube);

        this.placedArrow = new MeshNode(paletteIndex.brown);
        this.placedArrow.scale.set(0.005, 0.4, 0.005);
        this.placedArrow.position.set(0, -0.4 + 0.19, 0);

        this.scene.leftHand.addNode(...nodes, this.stringPart1, this.stringPart2, this.placedArrow);

        // this.scene.rightHand.onTrigger.on((value) => {
        //     if (value) {
        //         this.handRm.setColor([1.0, 0.0, 0.0, 1]);
        //     } else {
        //         this.handRm.setColor([0.0, 0.0, 1.0, 1]);
        //     }
        // });

        const tower = new Object3D();
        tower.setRenderer(this.renderer);
        tower.addNode(...this.getModel(TowerModel));
        tower.position.set(-15, -5, -15);

        const tower2 = new Object3D();
        tower2.setRenderer(this.renderer);
        tower2.addNode(...this.getModel(TowerModel));
        tower2.position.set(15, -5, -15);

        this.scene.addNode(tower);
        this.scene.addNode(tower2);
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

        this.scene.update(t);

        this.scene.updateMatrix();

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

            this.stringPart1.recalculate(this.scene.leftHand.children[5], this.scene.leftHand.children[7]);
            this.stringPart2.recalculate(this.scene.leftHand.children[6], this.scene.leftHand.children[7]);

            // if (this.bow.readyToDraw) {
            //     this.handRm.setColor([0.0, 1.0, 0.0, 1]);
            // } else {
            //     this.handRm.setColor([0.0, 0.0, 1.0, 1]);
            // }

            if (this.bow.state == State.DRAWN) {
                this.placedArrow!.position.set(0, -0.4 + 0.19 + this.bow.drawDistance, 0);
                this.placedArrow!.active = true;
            } else if (this.bow.state == State.IDLE) {
                this.placedArrow!.active = false;
            }

            this.scene.leftHand.children[7].position.set(0, 0.19 + this.bow.drawDistance, 0);

            // Loop through each of the views reported by the frame and draw them
            // into the corresponding viewport.
            for (let view of pose.views) {
                let viewport = glLayer.getViewport(view)!;
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                this.scene.render2(view.projectionMatrix, view.transform);
            }
        }

        // Per-frame scene teardown. Nothing WebXR specific here.
        //scene.endFrame();
    }

    getModel(model: number[][][]) {
        return model.map((props) => {
            const node = new MeshNode(props[3][0]);
            node.scale.set(...props[1]);
            node.position.set(...props[0]);
            node.quaternion.fromEuler(...props[2]);
            return node;
        });
    }

    spawnArrow(arrowData: ArrowData) {
        //const arrow = new MeshNode(this.arrowMesh, this.arrowMat);
        const arrow = new Arrow(paletteIndex.brown);
        arrow.position.copy(arrowData.position);
        arrow.quaternion.copy(arrowData.orientation);

        // calculate velocity based on arrowData.force and arrowData.direction
        arrow.velocity.copy(arrowData.direction).multiply(arrowData.force);
        console.log(arrow.velocity);

        this.arrowList.push(arrow);
        this.scene.addNode(arrow);
    }
}
