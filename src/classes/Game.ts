import {GL} from '../lib/GL';
import {Renderer} from '../lib/Renderer';
import {Material} from '../lib/Material';
import {Mesh} from '../lib/Mesh';
import {Scene} from './Scene';

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

    constructor() {
        console.log('Game started');
        this.initXR();
    }

    // Checks to see if WebXR is available and, if so, queries a list of
    // XRDevices that are connected to the system.
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

    // Called when the user selects a device to present to. In response we
    // will request an exclusive session from that device.
    onRequestSession() {
        return navigator
            .xr!.requestSession('immersive-vr')
            .then(this.onSessionStarted.bind(this));
    }

    // Called when we've successfully acquired a XRSession. In response we
    // will set up the necessary session state and kick off the frame loop.
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

        let scene = new Scene(this.renderer);

        const identityMatrix = new Float32Array([
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ]);
        const offsetMatrix = new Float32Array([
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -2, 1, -5, 1,
        ]);

        this.planeMesh = new Mesh(this.gl);
        this.planeMesh.loadFromData([
            10, 0, 10, 5.5, -4.5, 0, 1, 0, -10, 0, -10, -4.5, 5.5, 0, 1, 0, -10, 0, 10,
            -4.5, -4.5, 0, 1, 0, 10, 0, 10, 5.5, -4.5, 0, 1, 0, 10, 0, -10, 5.5, 5.5, 0, 1,
            0, -10, 0, -10, -4.5, 5.5, 0, 1, 0,
        ]);

        this.planeMaterial = new Material(this.gl);
        this.planeMaterial.setProjection(identityMatrix);
        this.planeMaterial.setView(identityMatrix);
        this.planeMaterial.setModel(identityMatrix);

        this.planeMaterial.setColor([0.0, 0.5, 0.2, 1]);

        this.cubeMesh = new Mesh(this.gl);
        this.cubeMesh.loadFromData([
            -1, 1, 1, 0.625, 0, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, -1, 1,
            0.375, 0, -1, 0, 0, -1, 1, -1, 0.625, 0.25, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0,
            0, -1, -1, -1, -1, 0.375, 0.25, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 1, 0, 0, 1, -1,
            1, 0.375, 0.75, 1, 0, 0, 1, -1, -1, 0.375, 0.5, 1, 0, 0, 1, 1, 1, 0.625, 0.75,
            0, 0, 1, -1, -1, 1, 0.375, 1, 0, 0, 1, 1, -1, 1, 0.375, 0.75, 0, 0, 1, 1, -1,
            -1, 0.375, 0.5, 0, -1, 0, -1, -1, 1, 0.125, 0.75, 0, -1, 0, -1, -1, -1, 0.125,
            0.5, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, 1, 1, 1, 0.625, 0.75, 0, 1, 0, 1,
            1, -1, 0.625, 0.5, 0, 1, 0, -1, 1, 1, 0.625, 0, -1, 0, 0, -1, 1, -1, 0.625,
            0.25, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, 1, -1, 0.625, 0.25, 0, 0,
            -1, 1, 1, -1, 0.625, 0.5, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0, 0, -1, 1, 1, -1,
            0.625, 0.5, 1, 0, 0, 1, 1, 1, 0.625, 0.75, 1, 0, 0, 1, -1, 1, 0.375, 0.75, 1, 0,
            0, 1, 1, 1, 0.625, 0.75, 0, 0, 1, -1, 1, 1, 0.625, 1, 0, 0, 1, -1, -1, 1, 0.375,
            1, 0, 0, 1, 1, -1, -1, 0.375, 0.5, 0, -1, 0, 1, -1, 1, 0.375, 0.75, 0, -1, 0,
            -1, -1, 1, 0.125, 0.75, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, -1, 1, 1,
            0.875, 0.75, 0, 1, 0, 1, 1, 1, 0.625, 0.75, 0, 1, 0,
        ]);

        this.cubeMaterial = new Material(this.gl);
        this.cubeMaterial.setProjection(identityMatrix);
        this.cubeMaterial.setView(identityMatrix);
        this.cubeMaterial.setModel(offsetMatrix);

        this.cubeMaterial.setColor([0.4, 0.4, 0.4, 1]);

        // Create a renderer with that GL context (this is just for the samples
        // framework and has nothing to do with WebXR specifically.)
        //const renderer = new Renderer(gl);
        // Set the scene's renderer, which creates the necessary GPU resources.
        //scene.setRenderer(renderer);
        // Use the new WebGL context to create a XRWebGLLayer and set it as the
        // sessions baseLayer. This allows any content rendered to the layer to
        // be displayed on the XRDevice.
        session.updateRenderState({baseLayer: new XRWebGLLayer(session, this.gl)});

        // Get a frame of reference, which is required for querying poses. In
        // this case an 'local' frame of reference means that all poses will
        // be relative to the location where the XRDevice was first detected.
        session.requestReferenceSpace('local').then((refSpace) => {
            this.xrRefSpace = refSpace;

            // Inform the session that we're ready to begin drawing.
            session.requestAnimationFrame(this.onXRFrame.bind(this));
        });
    }

    // Called when the user clicks the 'Exit XR' button. In response we end
    // the session.
    onEndSession(session) {
        session.end();
    }

    // Called either when the user has explicitly ended the session (like in
    // onEndSession()) or when the UA has ended the session for any reason.
    // At this point the session object is no longer usable and should be
    // discarded.
    onSessionEnded(event) {
        //xrButton.setSession(null);
        // In this simple case discard the WebGL context too, since we're not
        // rendering anything else to the screen with it.
        // renderer = null;
    }

    // Called every time the XRSession requests that a new frame be drawn.
    onXRFrame(t: DOMHighResTimeStamp, frame: XRFrame) {
        let session = frame.session;

        // Per-frame scene setup. Nothing WebXR specific here.
        //scene.startFrame();
        // Inform the session that we're ready for the next frame.
        session.requestAnimationFrame(this.onXRFrame.bind(this));

        // Get the XRDevice pose relative to the Frame of Reference we created
        // earlier.
        let pose = frame.getViewerPose(this.xrRefSpace);

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
            // Loop through each of the views reported by the frame and draw them
            // into the corresponding viewport.
            for (let view of pose.views) {
                let viewport = glLayer.getViewport(view)!;
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                this.planeMaterial.setProjection(view.projectionMatrix);
                this.planeMaterial.setView(view.transform.inverse.matrix);

                this.renderer.draw(this.planeMesh, this.planeMaterial);

                this.cubeMaterial.setProjection(view.projectionMatrix);
                this.cubeMaterial.setView(view.transform.inverse.matrix);

                this.renderer.draw(this.cubeMesh, this.cubeMaterial);
                //scene.draw(view.projectionMatrix, view.transform);
            }
        } else {
        }

        // Per-frame scene teardown. Nothing WebXR specific here.
        //scene.endFrame();
    }
}
