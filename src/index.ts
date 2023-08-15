import {Renderer} from './lib/Renderer';
import {Material} from './lib/Material';
import {Mesh} from './lib/Mesh';
import {Objs} from './lib/Objs';
import {Vector3} from './lib/Vector3';

let canvas!: HTMLCanvasElement; // we'll keep it as a global object
let gl!: WebGL2RenderingContext; // it will store our context, and all the functions and constants that are needed to use it

// this function resizes our canvas in a way, that makes it fit the entire screen perfectly!
function onResize() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

// sets the window's resize function to be the exact function we use for resizing our canvas
window.onresize = onResize;

let renderer: Renderer;
let mesh: Mesh;
let material: Material;
let planeMesh: Mesh;
let planeMaterial: Material;
let cubeMesh: Mesh;
let cubeMaterial: Material;
let controllerMesh: Mesh;
let controllerMaterial: Material;

function initWebGL2(attributes) {
    canvas = document.createElement('canvas'); // creates a new canvas element ( <canvas></canvas> )
    gl = canvas.getContext('webgl2', attributes || {alpha: false})!; // creates a WebGL2 context, using the canvas
    document.body.appendChild(canvas); // appends/adds the canvas element to the document's body
    canvas.style =
        'position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0;z-index: -1;'; // we add a simple style to our canvas
    onResize(); // calls our resize function, to make the canvas fit the screen
}

function onFrame() {
    gl.viewport(0, 0, canvas.width, canvas.height); // resizes the webgl2's virtual viewport to fit the entire screen
    renderer.clear([0.1, 0.1, 0.1, 1.0]); // clears the screen with the specified green color (RGBA)

    renderer.draw(mesh, material); // draws our triangle combined with the material of our choice

    // we also have to tell our browser that we want this function to be called again in the next frame
    window.requestAnimationFrame(onFrame);
}

let xrButton = document.getElementById('xr-button') as HTMLButtonElement;
let xrSession = null;
let xrRefSpace = null;
let controllers = {};

function initWebXR() {
    // our new init function
    if (navigator.xr) {
        // checks if our device supports WebXR
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            // we check if immersive-vr session is supported
            if (supported) {
                // if it is supported
                xrButton!.disabled = false; // enable the button (makes it possible to click it)
                xrButton!.textContent = 'Enter VR'; // change text on the button
                xrButton!.addEventListener('click', onButtonClicked); // add a new event to the button, which will run the onButtonClicked function
            }
        });
    }
}

function onButtonClicked() {
    // this function specifies what our button will do when clicked
    if (!xrSession) {
        // if our session is null - if it wasn't created
        navigator
            .xr!.requestSession('immersive-vr', {
                'requiredFeatures': ['local-floor'],
            })
            .then(onSessionStarted); // request it (start the session), and when the request is handled, call onSessionStarted
    } else {
        // if our session was started already
        xrSession.end(); // request our session to end
    }
}

function onSessionStarted(_session) {
    // this function defines what happens when the session is started
    xrSession = _session; // we set our session to be the session our request created
    xrSession.addEventListener('end', onSessionEnded); // we set what happenes when our session is ended

    initWebGL2({xrCompatible: true}); // we initialize WebGL2, in a way that makes it compatible with WebXR

    renderer = new Renderer(gl);
    renderer.depthTesting(true); // if you don't know what that means - it means that our meshes will be rendered properly ¯\_(ツ)_/¯

    const identityMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
    ]);
    const offsetMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 2.0, 1.0, -5.0, 1.0,
    ]);

    planeMesh = new Mesh(gl);
    // fetch('./plane.obj').then((response) => {
    //     response.text().then((text) => {
    //         const verticesLoaded = ezobj.load(text);
    //         //this.vertexbuffer.vertexData(verticesLoaded);
    //     });
    // });

    planeMesh.loadFromData(Objs.plane());

    planeMaterial = new Material(gl);
    planeMaterial.setProjection(identityMatrix);
    planeMaterial.setView(identityMatrix);
    planeMaterial.setModel(identityMatrix);

    planeMaterial.setColor([0.1, 0.5, 0.4, 1.0]);

    // cubeMesh = new Mesh(gl);
    // cubeMesh.loadFromOBJ('./cube.obj');

    // cubeMaterial = new Material(gl);
    // cubeMaterial.setProjection(identityMatrix);
    // cubeMaterial.setView(identityMatrix);
    // cubeMaterial.setModel(offsetMatrix);

    // cubeMaterial.setColor([0.4, 0.4, 0.4, 1.0]);

    controllerMesh = new Mesh(gl);
    controllerMesh.loadFromData(Objs.bow());

    controllerMaterial = new Material(gl);
    controllerMaterial.setProjection(identityMatrix);
    controllerMaterial.setView(identityMatrix);
    controllerMaterial.setModel(identityMatrix);

    xrSession.requestReferenceSpace('local-floor').then((refSpace) => {
        // we request our referance space - an object that defines where the center of our space lies. Here we request a local-floor referance space - that one defines the center of the world to be where the center of the ground is
        xrRefSpace = refSpace; // we set our referance space to be the one returned by this function
        let xrLayer = new XRWebGLLayer(xrSession, gl);

        //gl.enable(gl.CULL_FACE);
        //gl.frontFace(gl.CCW); // assuming your vertices are counter-clockwise ordered

        xrSession.updateRenderState({baseLayer: xrLayer});
        xrSession.requestAnimationFrame(onSessionFrame); // at this point everything has been set up, so we can finally request an animation frame, on a function with the name of onSessionFrame
    });

    function onSessionEnded() {
        // this function defines what happens when the session has ended
        xrSession = null; // we set our xrSession to be null, so that our button will be able to reinitialize it when we click it the next time
    }
}

function onSessionFrame(t, frame) {
    const session = frame.session; // frame is a frame handling object - it's used to get frame sessions, frame WebGL layers and some more things
    session.requestAnimationFrame(onSessionFrame); // we simply set our animation frame function to be this function again
    let pose = frame.getViewerPose(xrRefSpace); // gets the pose of the headset, relative to the previously gotten referance space

    if (pose) {
        // if the pose was possible to get (if the headset responds)
        let glLayer = session.renderState.baseLayer; // get the WebGL layer (it contains some important information we need)

        onControllerUpdate(session, frame); // update the controllers' state

        gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer); // sets the framebuffer (drawing target of WebGL) to be our WebXR display's framebuffer

        renderer.clear([0.5, 0.8, 1.0, 1.0]);

        for (let view of pose.views) {
            // we go through every single view out of our camera's views
            let viewport = glLayer.getViewport(view); // we get the viewport of our view (the place on the screen where things will be drawn)
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height); // we set our viewport appropriately

            planeMaterial.setProjection(view.projectionMatrix);
            planeMaterial.setView(view.transform.inverse.matrix);

            renderer.draw(planeMesh, planeMaterial);

            // cubeMaterial.setProjection(view.projectionMatrix);
            // cubeMaterial.setView(view.transform.inverse.matrix);

            // renderer.draw(cubeMesh, cubeMaterial);

            renderControllers(view);
        }
    }
}

function onControllerUpdate(session, frame) {
    for (let inputSource of session.inputSources) {
        // we loop through every input source (controller) caught by our session
        if (inputSource.gripSpace) {
            // we check if our controllers actually have their space
            let gripPose = frame.getPose(inputSource.gripSpace, xrRefSpace); // we get controller's pose, by comparing our controller's space to our referance space
            if (gripPose) {
                // we check if our controller's pose was gotten correctly
                controllers[inputSource.handedness] = {pose: gripPose}; // inputSource.handedness returns a string representing in which hand we have our controller - that is "left" or "right". Which means that controllers.left and controllers.right will from now on contain an element named "pose", which will simply be their corresponding XRPose
            }
        }
    }
}

function renderControllers(view) {
    if (controllers.left) {
        // checks if WebXR got our left controller
        controllerMaterial.setProjection(view.projectionMatrix);
        controllerMaterial.setView(view.transform.inverse.matrix);
        controllerMaterial.setModel(controllers.left.pose.transform.matrix); // we just get our model matrix for the controller

        controllerMaterial.setColor([0.6, 0.4, 0.2, 1.0]);

        renderer.draw(controllerMesh, controllerMaterial);
    }
    // if (controllers.right) {
    //     // checks if WebXR got our right controller
    //     controllerMaterial.setProjection(view.projectionMatrix);
    //     controllerMaterial.setView(view.transform.inverse.matrix);
    //     controllerMaterial.setModel(controllers.right.pose.transform.matrix); // we just get our model matrix for the controller

    //     controllerMaterial.setColor([0.5, 0.0, 0.0, 1.0]);

    //     renderer.draw(controllerMesh, controllerMaterial);
    // }
}

// we call our init function, therefore initializing the application
initWebXR();
