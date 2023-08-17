export class Program {
    _gl: any;
    program: any;
    attrib: null;
    uniform: null;
    defines: {};
    _firstUse: boolean;
    _nextUseCallbacks: never[];
    _vertShader: any;
    _fragShader: any;
    constructor(gl, vertSrc, fragSrc, attribMap, defines) {
        this._gl = gl;
        this.program = gl.createProgram();
        this.attrib = null;
        this.uniform = null;
        this.defines = {};

        this._firstUse = true;
        this._nextUseCallbacks = [];

        let definesString = '';
        if (defines) {
            for (let define in defines) {
                this.defines[define] = defines[define];
                definesString += `#define ${define} ${defines[define]}\n`;
            }
        }

        this._vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.attachShader(this.program, this._vertShader);
        gl.shaderSource(this._vertShader, definesString + vertSrc);
        gl.compileShader(this._vertShader);

        this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.attachShader(this.program, this._fragShader);
        gl.shaderSource(this._fragShader, definesString + fragSrc);
        gl.compileShader(this._fragShader);

        if (attribMap) {
            this.attrib = {};
            for (let attribName in attribMap) {
                gl.bindAttribLocation(this.program, attribMap[attribName], attribName);
                this.attrib[attribName] = attribMap[attribName];
            }
        }

        gl.linkProgram(this.program);
    }

    onNextUse(callback) {
        this._nextUseCallbacks.push(callback);
    }

    use() {
        let gl = this._gl;

        // If this is the first time the program has been used do all the error checking and
        // attrib/uniform querying needed.
        if (this._firstUse) {
            this._firstUse = false;
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
                    console.error(
                        'Vertex shader compile error: ' +
                            gl.getShaderInfoLog(this._vertShader)
                    );
                } else if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
                    console.error(
                        'Fragment shader compile error: ' +
                            gl.getShaderInfoLog(this._fragShader)
                    );
                } else {
                    console.error(
                        'Program link error: ' + gl.getProgramInfoLog(this.program)
                    );
                }
                gl.deleteProgram(this.program);
                this.program = null;
            } else {
                if (!this.attrib) {
                    this.attrib = {};
                    let attribCount = gl.getProgramParameter(
                        this.program,
                        gl.ACTIVE_ATTRIBUTES
                    );
                    for (let i = 0; i < attribCount; i++) {
                        let attribInfo = gl.getActiveAttrib(this.program, i);
                        this.attrib[attribInfo.name] = gl.getAttribLocation(
                            this.program,
                            attribInfo.name
                        );
                    }
                }

                this.uniform = {};
                let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
                let uniformName = '';
                for (let i = 0; i < uniformCount; i++) {
                    let uniformInfo = gl.getActiveUniform(this.program, i);
                    uniformName = uniformInfo.name.replace('[0]', '');
                    this.uniform[uniformName] = gl.getUniformLocation(
                        this.program,
                        uniformName
                    );
                }
            }
            gl.deleteShader(this._vertShader);
            gl.deleteShader(this._fragShader);
        }

        gl.useProgram(this.program);

        if (this._nextUseCallbacks.length) {
            for (let callback of this._nextUseCallbacks) {
                callback(this);
            }
            this._nextUseCallbacks = [];
        }
    }
}
