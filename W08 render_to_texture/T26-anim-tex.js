
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
		gl = canvas.getContext('webgl2', {
			stencil: false, alpha: true, depth: true, antialias: true, preserveDrawingBuffer: true
		});
		var ext = gl.getExtension('WEBGL_depth_texture');
	} catch (e) {
		// do nothing
	}
	if (!gl) {
		alert("Unable to initialise WebGL. Your browser may not support it");
		return false;
	}
	return true;
}

const map_size_x = 0.5;
const map_size_y = 0.5;

var vertData = [ // 4 vertices for a rectangle XYZW, STPQ
	-map_size_x, -map_size_y, 0.0, 1.0,   0.0, 0.0, 0.0, 1.0,
	+map_size_x, -map_size_y, 0.0, 1.0,   1.0, 0.0, 0.0, 1.0,
	-map_size_x, +map_size_y, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,
	+map_size_x, +map_size_y, 0.0, 1.0,   1.0, 1.0, 0.0, 1.0,
];

var texImage = [
	255,0,0,255,255,255,0,255,0,255,0,255,0,255,255,255,0,0,255,255,
	255,255,0,255,0,255,0,255,0,255,255,255,0,0,255,255,255,0,0,255,
	0,255,0,255,0,255,255,255,0,0,255,255,255,0,0,255,255,255,0,255,
	0,255,255,255,0,0,255,255,255,0,0,255,255,255,0,255,0,255,0,255,
];

var texObj;

function initTex() {
	texObj = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texObj);
	const texData = new Uint8Array( texImage );
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 5, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, texData); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	return testGLError("initTex");
}

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
	in vec2 aTexCoord; // texture coordinate 2D: attribute
	out vec2 vTexCoord; // texture coordinate 2D: varying
	void main(void) {
		gl_Position = aPos; // transformation
		gl_Position.z *= -1.0F; // negation for depth processing, if needed
		vTexCoord = aTexCoord;
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
	in highp vec2 vTexCoord; // texture coordinate 2D : varing
	uniform sampler2D texSampler; // texture sampler 2D
	out highp vec4 FragColor; // fragment color: framebuffer
	void main(void) {
		FragColor = texture( texSampler, vTexCoord );
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

var flagAnim = 0;

function toggleAnim() {
	flagAnim ^= 1;
	console.log("flagAnim=", flagAnim);
}

function renderScene() {
	if (typeof renderScene.theta == 'undefined') {
		renderScene.theta = 0.0;
		renderScene.dTheta = 0.05;
	}
	if (flagAnim == 1) {
		renderScene.theta += renderScene.dTheta;
	}
	// my part
	gl.useProgram(gl.progObj);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertBuf);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texObj);
	// update func part
	vertData[2 * 8 + 0] = -map_size_x + 0.2 * Math.cos( 1.25 * renderScene.theta ) - 0.2;
	vertData[2 * 8 + 1] = +map_size_y + 0.2 * Math.sin( 1.25 * renderScene.theta );
	vertData[3 * 8 + 0] = +map_size_x + 0.1 * Math.cos( 1.00 * renderScene.theta ) - 0.1;
	vertData[3 * 8 + 1] = +map_size_y + 0.1 * Math.sin( 1.00 * renderScene.theta );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertData), gl.STATIC_DRAW);
	// draw func part
	gl.clearColor(0.3, 0.1, 0.1, 1.0);
	gl.clearDepth(1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	// draw the rect
	gl.bindAttribLocation(gl.progObj, 0, "aPos");
	gl.bindAttribLocation(gl.progObj, 1, "aTexCoord");
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertBuf);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 32, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 32, 16);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
	if (!initTex()) {
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
			requestAnimFrame(renderLoop);
		}
	})();
}

