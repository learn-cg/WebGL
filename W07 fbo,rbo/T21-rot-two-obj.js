
var gl;

const { mat2, mat3, mat4, vec2, vec3, vec4 } = glMatrix;  // Now we can use function without glMatrix

function testGLError(functionLastCalled) {
	var lastError = gl.getError();
	if (lastError != gl.NO_ERROR) {
		alert(functionLastCalled + " failed (" + lastError + ")");
		return false;
	}
	return true;
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl2", {
			stencil: false, alpha: true, depth: true, antialias: false, preserveDrawingBuffer: true
		});
	} catch (e) {
		// do nothing
	}
	if (!gl) {
		alert("Unable to initialise WebGL. Your browser may not support it");
		return false;
	}
	return true;
}

var vertData = [
	// part 1: cube data 12 * 3 = 36 (vertices XYZW + color RGBA), total size = 288 floats, 1152 bytes
	// face 0,1: v0-v3-v2, v0-v2-v1, red
	-0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v0
	-0.5, -0.5, -0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v3
	+0.5, -0.5, -0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v2
	-0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v0
	+0.5, -0.5, -0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v2
	+0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 0.3, 1.0,    // v1
	// face 2,3: v1-v2-v6, v1-v6-v5, blue
	+0.5, -0.5, +0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v1
	+0.5, -0.5, -0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v2
	+0.5, +0.5, -0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v6
	+0.5, -0.5, +0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v1
	+0.5, +0.5, -0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v6
	+0.5, +0.5, +0.5, 1.0,    0.3, 0.3, 1.0, 1.0,    // v5
	// face 4,5: v2-v3-v7, v2-v7-v6, green
	+0.5, -0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v2
	-0.5, -0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v3
	-0.5, +0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v7
	+0.5, -0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v2
	-0.5, +0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v7
	+0.5, +0.5, -0.5, 1.0,    0.3, 1.0, 0.3, 1.0,    // v6
	// face 6,7: v3-v0-v4, v3-v4-v7, cyan
	-0.5, -0.5, -0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v3
	-0.5, -0.5, +0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v0
	-0.5, +0.5, +0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v4
	-0.5, -0.5, -0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v3
	-0.5, +0.5, +0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v4
	-0.5, +0.5, -0.5, 1.0,    0.3, 1.0, 1.0, 1.0,    // v7
	// face 8,9: v1-v5-v4, v1-v4-v0, magenta
	+0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v1
	+0.5, +0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v5
	-0.5, +0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v4
	+0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v1
	-0.5, +0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v4
	-0.5, -0.5, +0.5, 1.0,    1.0, 0.3, 1.0, 1.0,    // v0
	// face 10,11: v4-v5-v6, v4-v6-v7, yellow
	-0.5, +0.5, +0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v4
	+0.5, +0.5, +0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v5
	+0.5, +0.5, -0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v6
	-0.5, +0.5, +0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v4
	+0.5, +0.5, -0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v6
	-0.5, +0.5, -0.5, 1.0,    1.0, 1.0, 0.3, 1.0,    // v7
	// part 2: pyramid data 6 * 3 = 18 (vertices XYZW + color RGBA)
	// face 0: v0-v1-v2, red
	0.0, 0.5, 0.0, 1.0,    1.0, 0.3, 0.3, 1.0,    // v0
	0.5, -0.3, 0.0, 1.0,   1.0, 0.3, 0.3, 1.0,    // v1
	0.0, -0.3, -0.5, 1.0,  1.0, 0.3, 0.3, 1.0,    // v2
	// face 1: v0-v2-v3, green
	0.0, 0.5, 0.0, 1.0,    0.3, 1.0, 0.3, 1.0,    // v0
	0.0, -0.3, -0.5, 1.0,  0.3, 1.0, 0.3, 1.0,    // v2
	-0.5, -0.3, 0.0, 1.0,  0.3, 1.0, 0.3, 1.0,    // v3
	// face 2: v0-v3-v4, blue
	0.0, 0.5, 0.0, 1.0,    0.3, 0.3, 1.0, 1.0,    // v0
	-0.5, -0.3, 0.0, 1.0,  0.3, 0.3, 1.0, 1.0,    // v3
	0.0, -0.3, 0.5, 1.0,   0.3, 0.3, 1.0, 1.0,    // v4
	// face 3: v0-v4-v1, yellow
	0.0, 0.5, 0.0, 1.0,    1.0, 1.0, 0.3, 1.0,    // v0
	0.0, -0.3, 0.5, 1.0,   1.0, 1.0, 0.3, 1.0,    // v4
	0.5, -0.3, 0.0, 1.0,   1.0, 1.0, 0.3, 1.0,    // v1
	// face 4: v1-v4-v3, cyan
	0.5, -0.3, 0.0, 1.0,   0.3, 1.0, 1.0, 1.0,    // v1
	0.0, -0.3, 0.5, 1.0,   0.3, 1.0, 1.0, 1.0,    // v4
	-0.5, -0.3, 0.0, 1.0,  0.3, 1.0, 1.0, 1.0,    // v3
	// face 5: v1-v3-v2, cyan
	0.5, -0.3, 0.0, 1.0,   0.3, 1.0, 1.0, 1.0,    // v1
	-0.5, -0.3, 0.0, 1.0,  0.3, 1.0, 1.0, 1.0,    // v3
	0.0, -0.3, -0.5, 1.0,  0.3, 1.0, 1.0, 1.0,    // v2
];

function initBuf() {
	gl.vertBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertData), gl.STATIC_DRAW);
	return testGLError("initBufs");
}

function initShaders() {
	// vertex shader part
	var vertShaderSource = `#version 300 es
	in vec4 aPos; // vertex position: attribute
	in vec4 aColor; // vertex color: attribute
	out vec4 vColor; // varying color: varying
	uniform mat4 uModel; // model matrix: uniform
	uniform mat4 uView; // view matrix: uniform
	uniform mat4 uProj; // projection matrix: uniform
	void main(void) {
		gl_Position = uProj * uView * uModel * aPos; // transformation
		vColor = aColor;
	}`;
	gl.vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(gl.vertShader, vertShaderSource);
	gl.compileShader(gl.vertShader);
	if (!gl.getShaderParameter(gl.vertShader, gl.COMPILE_STATUS)) {
		alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertShader));
		return false;
	}
	// fragment shader part
	var fragShaderSource = `#version 300 es
	in highp vec4 vColor; // varying color: varing
	out highp vec4 FragColor; // fragment color: framebuffer
	void main(void) {
		FragColor = vColor;
	}`;
	gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(gl.fragShader, fragShaderSource);
	gl.compileShader(gl.fragShader);
	if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
		alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
		return false;
	}
	// program part
	gl.progObj = gl.createProgram();
	gl.attachShader(gl.progObj, gl.fragShader);
	gl.attachShader(gl.progObj, gl.vertShader);
	gl.linkProgram(gl.progObj);
	if (!gl.getProgramParameter(gl.progObj, gl.LINK_STATUS)) {
		alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.progObj));
		return false;
	}
	gl.useProgram(gl.progObj);
	return testGLError("initShaders");
}

var flagAnim = 1;

function toggleAnim() {
	flagAnim ^= 1;
	console.log("flagAnim=", flagAnim);
}

function renderScene() {
	if (typeof renderScene.theta == 'undefined') {
		renderScene.theta = 0.0;
		renderScene.dTheta = 0.02;
	}
	if (flagAnim == 1) {
		renderScene.theta += renderScene.dTheta;
	}
	// update func part
	gl.useProgram(gl.progObj);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertData), gl.STATIC_DRAW);
	// model transform for pyramid
	var uModelPyramid = mat4.create();
	mat4.translate( uModelPyramid, uModelPyramid, [-0.4, 0.0, 0.0] );
	mat4.rotate( uModelPyramid, uModelPyramid, 2.0 * renderScene.theta, [0.0, 1.0, 0.0] );
	mat4.scale( uModelPyramid, uModelPyramid, [0.5, 0.5, 0.5] );
	// model transform for cube
	var uModelCube = mat4.create();
	mat4.translate( uModelCube, uModelCube, [0.4, 0.0, 0.0] );
	mat4.rotate( uModelCube, uModelCube, 2.0 * renderScene.theta, [1.0, 0.0, 0.0] );
	mat4.scale( uModelCube, uModelCube, [0.3, 0.3, 0.3] );
	// view transform
	var uView = mat4.create();
	var radius = 2.0;
	mat4.lookAt(uView, [radius * Math.sin(renderScene.theta), 20 * 0.05, radius * Math.cos(renderScene.theta)],
	            [0.02, 0.0, 0.0], [0.0, 1.0, 0.0]);
	// projection transform
	var uProj = mat4.create();
	var zoom = 0.5;
	mat4.frustum(uProj, -1.0 * zoom, +1.0 * zoom, -1.0 * zoom, +1.0 * zoom, +1.0, +3.0);
	// draw func part
	gl.clearColor(0.3, 0.3, 0.3, 1.0);
	gl.clearDepth(1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	// matrix settings
	var locModel = gl.getUniformLocation(gl.progObj, "uModel");
	var locView = gl.getUniformLocation(gl.progObj, "uView");
	var locProj = gl.getUniformLocation(gl.progObj, "uProj");
	gl.uniformMatrix4fv(locView, gl.FALSE, uView );
	gl.uniformMatrix4fv(locProj, gl.FALSE, uProj );
	if (!testGLError("gl.uniformMatrix4fv")) {
		return false;
	}
	// draw the pyramid
	gl.uniformMatrix4fv(locModel, gl.FALSE, uModelPyramid );
	gl.bindAttribLocation(gl.progObj, 0, "aPos");
	gl.bindAttribLocation(gl.progObj, 1, "aColor");
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertBuf);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 32, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 32, 16);
	gl.drawArrays(gl.TRIANGLES, 36, 18); // pyramid
	// draw the cube
	gl.uniformMatrix4fv(locModel, gl.FALSE, uModelCube );
	gl.drawArrays(gl.TRIANGLES, 0, 36); // cube
	if (!testGLError("gl.drawArrays")) {
		return false;
	}
	// done
	gl.finish();
	return true;
}

function main() {
	var canvas = document.getElementById("canvas");
	if (!initGL(canvas)) {
		return;
	}
	if (!initBuf()) {
		return;
	}
	if (!initShaders()) {
		return;
	}
	requestAnimFrame = (function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000, 60);
		};
	})();
	(function renderLoop() {
		if (renderScene()) {
			// Everything was successful, request that we redraw our scene again in the future
			requestAnimFrame(renderLoop);
		}
	})();
}

