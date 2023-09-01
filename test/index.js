var Game = /** @class */ (function () {
    function Game() {
        var canvas = document.getElementById('canvas');
        this.gl = canvas.getContext('webgl2');
    }
    Game.prototype.onInitialize = function () {
        var _this = this;
        this.gl.clearColor(0, 0, 0, 1);
        var program = this.compileShader();
        var vertexArray = this.gl.createVertexArray();
        this.gl.bindVertexArray(vertexArray);
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
            0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
        ]), this.gl.STATIC_DRAW);
        var positionLocation = this.gl.getAttribLocation(program, 'vPosition');
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLocation);
        // const colorBuffer = this.gl.createBuffer();
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        // this.gl.bufferData(
        //     this.gl.ARRAY_BUFFER,
        //     new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]),
        //     this.gl.STATIC_DRAW
        // );
        // const colorLocation = this.gl.getAttribLocation(program, 'color');
        // this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);
        // this.gl.vertexAttribDivisor(colorLocation, 1);
        // this.gl.enableVertexAttribArray(colorLocation);
        var offsetBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, offsetBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0]), this.gl.STATIC_DRAW);
        var offsetLocation = this.gl.getAttribLocation(program, 'vOffset');
        this.gl.vertexAttribPointer(offsetLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(offsetLocation, 1);
        this.gl.enableVertexAttribArray(offsetLocation);
        // this.gl.bindVertexArray(null);
        this.resources = {
            positionBuffer: positionBuffer,
            colorBuffer: null,
            offsetBuffer: null,
            program: program,
            vertexArray: vertexArray,
        };
        requestAnimationFrame(function () { return _this.onRender(); });
    };
    Game.prototype.compileShader = function () {
        var vs = "\n        precision highp float;\n\n        //uniform mat4 uModelViewMatrix;\n        attribute vec4 vOffset;\n        attribute vec4 vPosition;\n        \n        \n        void main() {\n            gl_Position = vPosition+vOffset;\n        }\n    ";
        var fs = "\n      precision highp float;\n\n      void main() {\n        gl_FragColor = vec4(1.0,0.0,0.0, 1.0);\n      }\n    ";
        var vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vShader, vs);
        this.gl.compileShader(vShader);
        if (!this.gl.getShaderParameter(vShader, this.gl.COMPILE_STATUS)) {
            var info = this.gl.getShaderInfoLog(vShader);
            throw "Could not compile WebGL program. \n\n".concat(info);
        }
        var fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fShader, fs);
        this.gl.compileShader(fShader);
        var deb = this.gl.getExtension('WEBGL_debug_shaders');
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);
        // console.log(deb?.getTranslatedShaderSource(vShader));
        return program;
    };
    Game.prototype.onRender = function () {
        var _this = this;
        // schedule next frame
        requestAnimationFrame(function () { return _this.onRender(); });
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.bindVertexArray(this.resources.vertexArray);
        this.gl.useProgram(this.resources.program);
        //this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 3, 4);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 36, 4);
    };
    return Game;
}());
var game = new Game();
game.onInitialize();
