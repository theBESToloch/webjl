let canvas = document.getElementById("canvas");
let info = document.getElementById("info");
let additional = document.getElementById("additional");
let width = canvas.clientWidth;
let height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;

let gl = initWebGL(canvas, width, height);      // инициализация контекста GL

let vertexShaderText = document.getElementById("shader-vs").innerText;
let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);

let fragmentShaderText = document.getElementById("shader-fs").innerText;
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

let program = createProgram(gl, vertexShader, fragmentShader);

gl.useProgram(program);

let positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
gl.enableVertexAttribArray(positionAttribLocation);

let colorAttribLocation = gl.getAttribLocation(program, "vertexColor");
gl.enableVertexAttribArray(colorAttribLocation);

let uniformLocation = gl.getUniformLocation(program, "uPMatrix");
let uniformPerLocation = gl.getUniformLocation(program, "uPerMatrix");

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("Program validate error info:" + gl.getProgramInfoLog(program));
    }
    return program;
}

function createShader(gl, shaderType, shaderText) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error info:" + gl.getShaderInfoLog(shader));
    }
    return shader;
}

function initWebGL(canvas, width, height) {
    let gl = null;

    try {
        // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {
        console.error(e);
    }

    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        throw new Error();
    }

    gl.viewport(0, 0, width, height);

    gl.clearColor(200.0, 200.0, 200.0, 1.0);                      // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST);                               // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // очистить буфер цвета и буфер глубины.

    return gl;
}