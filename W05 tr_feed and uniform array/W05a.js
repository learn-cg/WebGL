var gl;

function testGLError(functionLastCalled) {
    var lastError = gl.getError();
    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        gl = canvas.getContext("webgl2"); 
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL 2. Your browser may not support it");
        return false;
    }

    return true;
}

var rotZ = 0; // Rotation angle in degrees
var rotationMatrices = []; // Array to hold all rotation matrices

function initialiseBuffer() {

    var vertexData = [
        -0.4, -0.4, 0.0, // Bottom left
         0.4, -0.4, 0.0, // Bottom right
         0.0, 0.7, 0.0  // Top middle
    ];

    // Create and bind Vertex Array Object (VAO) - required for WebGL 2
    gl.vao = gl.createVertexArray();
    gl.bindVertexArray(gl.vao);

    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    
    // Set up vertex attribute pointer
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);

    // Precompute all rotation matrices for 360 degrees
    rotationMatrices = [];
    for (var i = 0; i < 360; ++i) {
        var rad = i * Math.PI / 180.0;
        var cosR = Math.cos(rad);
        var sinR = Math.sin(rad);
        rotationMatrices.push(
            cosR, -sinR, 0.0, 0.0,
            sinR,  cosR, 0.0, 0.0,
            0.0,   0.0,  1.0, 0.0,
            0.0,   0.0,  0.0, 1.0
        );
    }

    // Unbind VAO
    gl.bindVertexArray(null);
    
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 FragColor;

void main(void)
{ 
    FragColor = vec4(1.0, 1.0, 0.66, 1.0);
}`;
    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);

    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false; 
    }   
    
    // Vertex shader code
    var vertexShaderSource = `#version 300 es
precision mediump float;
in vec4 myVertex;
uniform mat4 transformationMatrix[360];
uniform int matrixIndex;

void main(void) 
{
    gl_Position = transformationMatrix[matrixIndex] * myVertex;
}`;
    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");

    // Link the program
    gl.linkProgram(gl.programObject);

    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    // Send all rotation matrices to the shader as a uniform array
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    gl.uniformMatrix4fv(matrixLocation, false, new Float32Array(rotationMatrices));

    return testGLError("initialiseShaders");
}

function renderScene() {
 
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the current matrix index
    var indexLocation = gl.getUniformLocation(gl.programObject, "matrixIndex");
    gl.uniform1i(indexLocation, rotZ);

    if (!testGLError("gl.uniform1i")) {
        return false;
    }

    // Bind the VAO (this automatically sets up all vertex attributes)
    gl.bindVertexArray(gl.vao);

    if (!testGLError("gl.bindVertexArray")) {
        return false;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}



function main() {
    var canid = document.getElementById("helloapicanvas");

    if (!initialiseGL(canid)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000, 60);
			};
    })();

    (function renderLoop() {
        rotZ = (rotZ + 1) % 360; // Increment rotation angle, keep in [0,360)
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
