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

var vao;
var vertexCount = 3;
var translationX = 0.0;
var bufferA, bufferB;
var readBuffer, writeBuffer;
var drawVAO;

function initialiseBuffer() {
    var vertexData = [
        -0.4, -0.4, 0.0,
         0.4, -0.4, 0.0,
         0.0, 0.7, 0.0
    ];

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    bufferA = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_COPY);

    bufferB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_COPY);

    readBuffer = bufferA;
    writeBuffer = bufferB;

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    // Create draw VAO for rendering
    drawVAO = gl.createVertexArray();
    gl.bindVertexArray(drawVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, readBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    return testGLError("initialiseBuffers");
}

var tfProgram, drawProgram;

function initialiseShaders() {
    // Transform feedback shader
    var tfVertexShaderSource = `#version 300 es
    in vec3 position;
    uniform float translationX;
    out vec3 tfPosition;
    void main() {
        tfPosition = position + vec3(translationX, 0.0, 0.0);
    }`;

    var tfFragmentShaderSource = `#version 300 es
    precision mediump float;
    out vec4 FragColor;
    void main() {
        FragColor = vec4(0.0); // Not used
    }`;

    var tfVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(tfVertexShader, tfVertexShaderSource);
    gl.compileShader(tfVertexShader);

    var tfFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(tfFragmentShader, tfFragmentShaderSource);
    gl.compileShader(tfFragmentShader);

    tfProgram = gl.createProgram();
    gl.attachShader(tfProgram, tfVertexShader);
    gl.attachShader(tfProgram, tfFragmentShader);

    gl.transformFeedbackVaryings(tfProgram, ["tfPosition"], gl.SEPARATE_ATTRIBS);
    gl.bindAttribLocation(tfProgram, 0, "position");
    gl.linkProgram(tfProgram);

    // Drawing shader
    var drawVertexShaderSource = `#version 300 es
    in vec3 position;
    void main() {
        gl_Position = vec4(position, 1.0);
    }`;

    var drawFragmentShaderSource = `#version 300 es
    precision mediump float;
    out vec4 FragColor;
    void main() {
        FragColor = vec4(1.0, 1.0, 0.66, 1.0);
    }`;

    var drawVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(drawVertexShader, drawVertexShaderSource);
    gl.compileShader(drawVertexShader);

    var drawFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(drawFragmentShader, drawFragmentShaderSource);
    gl.compileShader(drawFragmentShader);

    drawProgram = gl.createProgram();
    gl.attachShader(drawProgram, drawVertexShader);
    gl.attachShader(drawProgram, drawFragmentShader);

    gl.bindAttribLocation(drawProgram, 0, "position");
    gl.linkProgram(drawProgram);

    return testGLError("initialiseShaders");
}

function transformFeedbackStep() {
    gl.useProgram(tfProgram);

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, readBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var translationLoc = gl.getUniformLocation(tfProgram, "translationX");
    gl.uniform1f(translationLoc, translationX);

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, writeBuffer);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, vertexCount);
    gl.endTransformFeedback();

    gl.disable(gl.RASTERIZER_DISCARD);

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindVertexArray(null);

    // Swap buffers
    var temp = readBuffer;
    readBuffer = writeBuffer;
    writeBuffer = temp;

    // Update draw VAO to use the new readBuffer
    gl.bindVertexArray(drawVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, readBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    return testGLError("transformFeedbackStep");
}

function renderScene() {
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(drawProgram);

    gl.bindVertexArray(drawVAO);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    gl.bindVertexArray(null);

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

    // Initial copy: run transform feedback once to initialize writeBuffer
    transformFeedbackStep();

    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    (function renderLoop() {
        // translationX is now a random value between -0.01 and 0.01
        translationX = (Math.random() * 0.02) - 0.01;
        // translationX = 0.01;
        transformFeedbackStep();
        if (renderScene()) {
            requestAnimFrame(renderLoop);
        }
    })();
}