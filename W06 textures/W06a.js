var gl;
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

function testGLError(functionLastCalled) {
    var lastError = gl.getError();
    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    gl = canvas.getContext('webgl2', {
        stencil: true, alpha: true, depth: true, antialias: true, preserveDrawingBuffer: false
    });
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (!gl) {
        alert("Unable to initialise WebGL2. Your browser may not support it");
        return false;
    }
    return true;
}

var num_vertex = 36; 
var opacity1 = 1.0; 
var opacity2 = 1.0; 

var vertexData = [
		// Backface (RED/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, opacity1,  0.0,  0.0,
         0.5,  0.5, -0.5,  1.0, 0.0, 0.0, opacity1,  1.0,  1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 0.0, opacity1,  1.0,  0.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, opacity2,  0.0,  0.0,
        -0.5,  0.5, -0.5,  1.0, 0.0, 0.0, opacity2,  0.0,  1.0,
         0.5,  0.5, -0.5,  1.0, 0.0, 0.0, opacity2,  1.0,  1.0, 
		// Front (BLUE/WHITE) -> z = 0.5           
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, opacity1,  0.0,  0.0,
         0.5, -0.5,  0.5,  0.0, 0.0, 1.0, opacity1,  3.0,  0.0,
		 0.5,  0.5,  0.5,  0.0, 0.0, 1.0, opacity1,  3.0,  3.0,
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, opacity2,  0.0,  0.0,
         0.5,  0.5,  0.5,  0.0, 0.0, 1.0, opacity2,  3.0,  3.0, 
		-0.5,  0.5,  0.5,  0.0, 0.0, 1.0, opacity2,  0.0,  3.0,
		// LEFT (GREEN/WHITE) -> z = 0.5                       
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, opacity2,  0.0,  0.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, opacity2,  1.0,  1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, opacity2,  1.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, opacity1,  0.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, 1.0, 0.0, opacity1,  0.0,  1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, opacity1,  1.0,  1.0, 
		// RIGHT (YELLOW/WHITE) -> z = 0.5         
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, opacity1,  0.0,  0.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 0.0, opacity1,  1.0,  0.0,
		 0.5,  0.5,  0.5,  1.0, 1.0, 0.0, opacity1,  1.0,  1.0,
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, opacity2,  0.0,  0.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 0.0, opacity2,  1.0,  1.0, 
		 0.5, -0.5,  0.5,  1.0, 1.0, 0.0, opacity2,  0.0,  1.0,
		// BOTTON (MAGENTA/WHITE) -> z = 0.5                   
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, opacity1,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 1.0, opacity1,  1.0,  0.0,
		 0.5, -0.5,  0.5,  1.0, 0.0, 1.0, opacity1,  1.0,  1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, opacity2,  0.0,  0.0,
         0.5, -0.5,  0.5,  1.0, 0.0, 1.0, opacity2,  1.0,  1.0, 
		-0.5, -0.5,  0.5,  1.0, 0.0, 1.0, opacity2,  0.0,  1.0,
		// TOP (CYAN/WHITE) -> z = 0.5                         
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, opacity2,  0.0,  0.0,
         0.5,  0.5,  0.5,  0.0, 1.0, 1.0, opacity2,  1.0,  1.0,
         0.5,  0.5, -0.5,  0.0, 1.0, 1.0, opacity2,  1.0,  0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, opacity1,  0.0,  0.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, opacity1,  0.0,  1.0,
         0.5,  0.5,  0.5,  0.0, 1.0, 1.0, opacity1,  1.0,  1.0 
];

var tex1, tex2;

function initialiseBuffer() {
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);

    tex1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    const texData = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, texData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    tex2 = gl.createTexture();
    var image = new Image();
    image.src = "hylee_128.png";
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, tex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    });
    return testGLError("initialiseBuffers");
}

function updateBuffer() {
    for (var i=0; i< 6; i++) {
        vertexData[i*54+6] = vertexData[i*54+15] = vertexData[i*54+24] = opacity1; 
        vertexData[i*54+33] = vertexData[i*54+42] = vertexData[i*54+51] = opacity2;
    }			
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);
    return testGLError("updateBuffers");
}

function initialiseShaders() {
    var fragmentShaderSource = `#version 300 es
        precision highp float;
        in vec4 col;
        in vec2 uv;
        uniform sampler2D tex1;
        uniform sampler2D tex2;
        out vec4 fragColor;
        void main(void) {
            fragColor = 0.3 * col + 0.3 * texture(tex1, uv) + 0.4 * texture(tex2, uv);
        }`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    var vertexShaderSource = `#version 300 es
        in vec4 myVertex;
        in vec4 myColor;
        in vec2 myUV;
        uniform mat4 mMat;
        uniform mat4 vMat;
        uniform mat4 pMat;
        out vec4 col;
        out vec2 uv;
        void main(void) {
            gl_Position = pMat * vMat * mMat * myVertex;
            gl_PointSize = 8.0;
            col = myColor;
            uv = myUV;
        }`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    gl.programObject = gl.createProgram();
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    gl.bindAttribLocation(gl.programObject, 2, "myUV");

    gl.linkProgram(gl.programObject);
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

// --- UI and animation variables/functions (same as T11.js, but adapted for WebGL2) ---
var xRot = 0.0;
var yRot = 0.0;
var zRot = 0.0;
var speedRot = 0.01; 

var flag_animation = 0; 
var flag_draw_stencil = 0; 
var flag_draw_twice = 0;
var twice_x=0.2, twice_y=0.2, twice_z=0.2; 
function fn_twice_position() {
    twice_x = Number(document.getElementById('twice_x').value);
    twice_y = Number(document.getElementById('twice_y').value);
    twice_z = Number(document.getElementById('twice_z').value);
}

function fn_speed_scale(a) { speedRot *= a; }
var draw_mode = 4;
function fn_draw_mode(a) { draw_mode = a; }
var fov_degree = 90.0; 
function fn_update_fov(val) {
    document.getElementById('textFOV').value=val; 
    fov_degree = val; 
}
function fn_toggle(mode) {
    if (gl.isEnabled(mode)) gl.disable(mode);
    else gl.enable(mode); 
}
function fn_cull_mode(val) { gl.cullFace(val); }
function fn_scissor() {
    gl.scissor(document.getElementById('scissorx').value, document.getElementById('scissory').value,
    document.getElementById('scissorw').value,document.getElementById('scissorh').value);
}
function fn_polygonOffset() {
    gl.polygonOffset(document.getElementById('offset_f').value,document.getElementById('offset_u').value);
}
function fn_depth_mode(val) { gl.depthFunc(val); }

var mMat, vMat, pMat; 
var depth_clear_value = 1.0; 

var blend_const_color = [0,0,0,1.0]; 
var blend_sc_func = 1;		// gl.ONE
var blend_dc_func = 0;		// gl.ZERO
var blend_color_op = 32774; // gl.FUNC_ADD; 
var blend_sa_func = 1; 		// gl.ONE
var blend_da_func = 0;		// gl.ZERO
var blend_alpha_op = 32774; // gl.FUNC_ADD; 

var sample_coverage_value = 1.0;
var flag_sample_coverage_inverse = 0;

function renderScene() {
    gl.clearColor(0.5, 0.5, 0.5, 0.0);
    gl.clearDepth(depth_clear_value);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (gl.isEnabled(gl.SAMPLE_COVERAGE))
        gl.sampleCoverage(sample_coverage_value, flag_sample_coverage_inverse);

    if (gl.isEnabled(gl.BLEND)) {
        gl.blendFuncSeparate(blend_sc_func, blend_dc_func, blend_sa_func, blend_da_func); 
        gl.blendEquationSeparate(blend_color_op, blend_alpha_op);
        gl.blendColor(blend_const_color[0], blend_const_color[1], blend_const_color[2], blend_const_color[3]);
    }

    var mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
    var vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
    var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");

    pMat = mat4.create();
    vMat = mat4.create();
    mMat = mat4.create();
    mat4.perspective(pMat, fov_degree * Math.PI / 180.0, 8.0/6.0, 0.5, 6);
    mat4.lookAt(vMat, [0,0,2], [0.0,0.0,0.0], [0,1,0]);
    mat4.rotateX(mMat, mMat, xRot);
    mat4.rotateY(mMat, mMat, yRot);
    mat4.rotateZ(mMat, mMat, zRot);

    var tex1Location = gl.getUniformLocation(gl.programObject, "tex1");
    var tex2Location = gl.getUniformLocation(gl.programObject, "tex2");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.uniform1i(tex1Location, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.uniform1i(tex2Location, 1);

    if (flag_animation == 1) {
        yRot = yRot + speedRot;
        zRot = zRot + 2 * speedRot;
    }

    gl.uniformMatrix4fv(mMatLocation, false, mMat);
    gl.uniformMatrix4fv(vMatLocation, false, vMat);
    gl.uniformMatrix4fv(pMatLocation, false, pMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 36, 28);

    if (flag_draw_stencil) {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilMask(0xFF);
        gl.clearStencil(0);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilFunc(gl.ALWAYS, 1, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        gl.colorMask(false, false, false, false);
        gl.drawArrays(draw_mode, 0, 6);
        gl.stencilFunc(gl.EQUAL, 1, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        gl.colorMask(true, true, true, true);
    } else {
        gl.disable(gl.STENCIL_TEST);
    }

    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.drawArrays(draw_mode, 0, Math.min(num_vertex, vertexData.length / 9));

    if (flag_draw_twice) {
        mat4.translate(mMat, mMat, [twice_x, twice_y, twice_z]);
        gl.uniformMatrix4fv(mMatLocation, false, mMat);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.drawArrays(draw_mode, 0, Math.min(num_vertex, vertexData.length / 9));
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");
    if (!initialiseGL(canvas)) return;
    if (!initialiseBuffer()) return;
    if (!initialiseShaders()) return;
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) { window.setTimeout(callback, 1000, 60); };
    })();
    (function renderLoop() {
        if (renderScene()) requestAnimFrame(renderLoop);
    })();
}
