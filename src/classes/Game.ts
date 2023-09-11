import {GL} from '../lib/GL';
import {Renderer} from '../lib/Renderer';
import {Scene} from './Scene';
import {MeshNode} from '../lib/MeshNode';
import {Formations, Waves, paletteIndex} from './Consts';
import {Object3D} from '../lib/Object3D';
import {BowModel, EnemyModel, EnemyModel2, EnemyModel3, Pine, Shrub, TowerModel, Wall} from './Models';
import {Arrow, ArrowData, Bow, State, StringPart} from './Bow';
import {Controller} from './Controller';
import {knightNode} from './Knight';
import {SFX, Sounds} from './sfx';

new EventSource('/esbuild').addEventListener('change', () => location.reload());

const ROW_DELAY = 3; // start delay between rows in seconds
const WAVE_DELAY = 20; // delay between waves in seconds

/**
 * Represents the game object.
 */
export class Game {
    // XR globals.
    xrButton!: HTMLButtonElement;
    xrRefSpace!: XRReferenceSpace | XRBoundedReferenceSpace;
    xrSession?: XRSession;
    gl!: WebGL2RenderingContext;
    renderer!: Renderer;
    cube!: Object3D;
    scene!: Scene;
    bow?: Bow;
    stringPart1?: StringPart;
    stringPart2?: StringPart;
    //handRm: any;
    placedArrow?: MeshNode;
    //arrowMesh: Mesh;
    arrowList: Arrow[] = [];

    army: knightNode[] = [];
    battlefield?: Object3D;

    currentwave = -1;
    currentScore = 0;

    accumulatedTime = WAVE_DELAY;
    currentRow = 0;

    constructor() {
        console.log('Game started');

        let webglCanvas = document.createElement('canvas');
        // Create a WebGL context to render with, initialized to be compatible
        // with the XRDisplay we're presenting to.
        this.gl = webglCanvas.getContext('webgl2', {
            xrCompatible: true,
            alpha: false,
        })!;
        this.renderer = new Renderer(this.gl);
        this.renderer.depthTesting(true); // if you don't know what that means - it means that our meshes will be rendered properly ¯\_(ツ)_/¯

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

        SFX.initAudio();

        this.xrSession = session; // we set our session to be the session our request created
        this.xrSession.addEventListener('end', this.onSessionEnded.bind(this)); // we set what happenes when our session is ended

        this.xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(this.xrSession, this.gl),
        }); // this line simply sets our session's WebGL context to our WebGL2 context

        this.currentwave = 0;
        this.currentScore = 0;
        this.accumulatedTime = WAVE_DELAY - 3;
        this.currentRow = 0;
        this.army = [];
        this.prevTime = null; // skip first frame again to correct timer

        this.createScene();

        session.updateRenderState({baseLayer: new XRWebGLLayer(session, this.gl)});

        session.requestReferenceSpace('local').then((refSpace) => {
            // make sure the camera starts 1.6m below the floor level
            const xform = new XRRigidTransform({y: -1.6});
            this.xrRefSpace = refSpace.getOffsetReferenceSpace(xform);

            session.requestAnimationFrame(this.onXRFrame.bind(this));
        });
    }

    /**
     * Creates the game scene with the ground, battlefield, controllers, bow, arrow, string, wall, and towers.
     */
    private createScene() {
        this.scene = new Scene(this.renderer);

        const ground = new MeshNode(paletteIndex.green);
        ground.scale.set(150, 0.1, 150);
        ground.position.set(0, -5, 0);
        this.scene.addNode(ground);

        this.battlefield = new Object3D();
        this.battlefield.name = 'battlefield';
        this.battlefield.position.set(0, -5, 0);
        this.scene.addNode(this.battlefield);

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

        this.placedArrow = new MeshNode(paletteIndex.brown);
        this.placedArrow.scale.set(0.005, 0.4, 0.005);
        this.placedArrow.position.set(0, -0.4 + 0.19, 0);

        this.scene.leftHand.addNode(...nodes, this.stringPart1, this.stringPart2, this.placedArrow);

        this.addObjectToScene(Wall, [8, -5.3, 4]);
        this.addObjectToScene(Wall, [8, -1.3, 8]);
        this.addObjectToScene(Wall, [-12, -5.35, 8]).quaternion.fromEuler(0, Math.PI / 4, 0);
        this.addObjectToScene(Wall, [12, -5.35, 23]).quaternion.fromEuler(0, -Math.PI / 4, 0);
        this.addObjectToScene(TowerModel, [-15, -2, -2]);
        this.addObjectToScene(TowerModel, [15, -2, -2]);
        this.addObjectToScene(TowerModel, [-12, -0.5, 4.5]);
        this.addObjectToScene(TowerModel, [12, -0.5, 4.5]);
        this.addObjectToScene(TowerModel, [0, 3, 6]);

        //this.addObjectToScene(EnemyModel3, [0, 0, -6]);

        for (let i = 0; i < 100; i++) {
            const x = i * 2 + Math.random() - 0.5;
            const y = Math.sin((i / 100) * Math.PI);
            this.addObjectToScene(Pine, [100 - x, -5, -Math.random() * 20 - y * 50]).scale.set(1, Math.random() + 1, 1);
        }

        for (let i = 0; i < 25; i++) {
            const x = i * 2 + Math.random() - 0.5;
            const y = -Math.random() * 50;
            const s = Math.random() * 0.5 + 0.1;
            this.addObjectToScene(Shrub, [25 - x, -4.5, y]).scale.set(s, s, s);
        }
    }

    /**
     * Called either when the user has explicitly ended the session (like in
     * onEndSession()) or when the UA has ended the session for any reason.
     * At this point the session object is no longer usable and should be
     * discarded.
     * @param event The event that caused the session to end.
     */
    onSessionEnded(event) {
        this.xrSession = undefined;
    }

    prevTime: number | null = null;

    /**
     * Called every time the XRSession requests that a new frame be drawn.
     */
    onXRFrame(t: DOMHighResTimeStamp, frame: XRFrame) {
        let session = frame.session;
        // initialize prevTime on the first run
        if (this.prevTime === null) {
            this.prevTime = t;
            session.requestAnimationFrame(this.onXRFrame.bind(this));
            return; // skip further execution for this frame
        }

        const deltaTime = (t - this.prevTime) / 1000;
        this.prevTime = t;
        // Per-frame scene setup. Nothing WebXR specific here.
        //scene.startFrame();
        // Inform the session that we're ready for the next frame.
        session.requestAnimationFrame(this.onXRFrame.bind(this));

        // Get the XRDevice pose relative to the Frame of Reference we created
        // earlier.
        let pose = frame.getViewerPose(this.xrRefSpace);

        // Check if any Arrow is close to any Knight
        this.checkKnightHits();
        this.knightFrameUpdate(deltaTime);
        this.deleteInactiveArrows();

        if (this.knightReachedCastle()) {
            this.xrSession!.end().then(() => {
                let normalTitle = document.querySelector('.title.normal')! as HTMLElement;
                normalTitle.style.display = 'none';

                let gameover = document.querySelector('.game-over')! as HTMLElement;
                gameover.style.display = 'block';

                let scorecontainer = document.querySelector('.score-container')! as HTMLElement;
                scorecontainer.style.display = 'block';

                document.getElementById('score')!.innerText = `${this.currentScore}`;

                this.xrSession = undefined;
            });
            return;
        }

        this.scene.update(deltaTime);

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

            this.bow!.update(
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

            this.stringPart1!.recalculate(this.scene.leftHand.children[5], this.scene.leftHand.children[7]);
            this.stringPart2!.recalculate(this.scene.leftHand.children[6], this.scene.leftHand.children[7]);

            if (this.bow!.state == State.DRAWN) {
                this.placedArrow!.position.set(0, -0.4 + 0.19 + this.bow!.drawDistance, 0);
                this.placedArrow!.active = true;
            } else if (this.bow!.state == State.IDLE) {
                this.placedArrow!.active = false;
            }

            this.scene.leftHand.children[7].position.set(0, 0.19 + this.bow!.drawDistance, 0);

            this.scene.updateMatrix();

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

    private deleteInactiveArrows() {
        this.arrowList.forEach((arrow) => {
            if (!arrow.active) {
                this.arrowList.splice(this.arrowList.indexOf(arrow), 1);
            }
        });
    }

    private checkKnightHits() {
        this.army.forEach((knight) => {
            this.arrowList.forEach((arrow) => {
                if (arrow.position.distanceTo(knight.position) < 2) {
                    this.arrowList.splice(this.arrowList.indexOf(arrow), 1);
                    if (knight.hit()) {
                        this.currentScore++;
                    }
                    return;
                }
            });
        });
    }

    private getModel(model: number[][][]) {
        return model.map((props) => {
            const node = new MeshNode(props[3][0]);
            node.scale.set(...props[1]);
            node.position.set(...props[0]);
            node.quaternion.fromEuler(...props[2]);
            return node;
        });
    }

    private spawnArrow(arrowData: ArrowData) {
        SFX.playSound(Sounds.shoot);
        const arrow = new Arrow(paletteIndex.brown);
        this.arrowList.push(arrow);
        this.scene.addNode(arrow);

        arrow.position.copy(arrowData.position);
        arrow.quaternion.copy(arrowData.orientation);

        // calculate velocity based on arrowData.force and arrowData.direction
        arrow.velocity.copy(arrowData.direction).multiply(arrowData.force);

        arrow.isStatic = false;
    }

    private spawnKnight(j: number, i: number, type: number) {
        let knight = new knightNode(type);
        knight.isStatic = false;
        knight.setRenderer(this.renderer);
        switch (type) {
            case 1:
                knight.addNode(...this.getModel(EnemyModel));
                break;
            case 2:
                knight.addNode(...this.getModel(EnemyModel2));
                break;
            case 3:
                knight.addNode(...this.getModel(EnemyModel3));
                break;
        }
        knight.position.set(11 - j * 2, 0.25 - 5, -40 - i * 2);
        knight.scale.set(0.4, 0.4, 0.4);

        this.army.push(knight);
        this.battlefield!.addNode(knight);
    }

    private knightReachedCastle(): boolean {
        return this.army.some((knight) => knight.position.z > -1);
    }

    private addObjectToScene(modelName: number[][][], position: [number, number, number]): Object3D {
        const object = new Object3D();
        object.setRenderer(this.renderer);
        object.addNode(...this.getModel(modelName));
        object.position.set(...position);
        this.scene.addNode(object);
        return object;
    }

    private knightFrameUpdate(deltaTime: number) {
        // 1 accumulated the time
        // 4 after WAVE_DELAY span next wave.
        // 5 repeat from 4
        // 6 when all waves are passed increase the speed and start from a specified wave.
        // 7 continue to impossisble speeds.

        // Your game loop update function.
        this.accumulatedTime += deltaTime;

        if (this.accumulatedTime >= WAVE_DELAY) {
            if (this.currentwave < Waves.length) {
                const currentWave = Waves[this.currentwave];
                for (let q = 0; q < currentWave.length; q++) {
                    const currentFormation = +currentWave[q];
                    if (isNaN(currentFormation)) {
                        continue;
                    }
                    const knightsInFormation = Formations[currentFormation]
                        .split('\n')
                        .map((row) => [...row].map((cell) => parseInt(cell, 10)));

                    const offset = q == 0 ? -10 : q == 2 ? 10 : 0;
                    for (let i = 0; i < knightsInFormation.length; i++) {
                        for (let j = 0; j < knightsInFormation[i].length; j++) {
                            if (!isNaN(knightsInFormation[i][j])) {
                                const knightType = knightsInFormation[i][j];
                                this.spawnKnight(j - offset, i, knightType);
                            }
                        }
                    }
                }

                this.currentRow++;
                this.accumulatedTime -= WAVE_DELAY; // Reset the timer.
            } else {
                //this.currentwave ;
            }
        }
    }
}
