let canvas = document.getElementById("canvas");

let width = canvas.clientWidth;
let height = canvas.clientHeight;

canvas.width = width;
canvas.height = height;

let vertexShaderText = "\n" +
    "attribute vec3 vertexPosition;\n" +
    "attribute vec3 vertexColor;\n" +
    "varying vec3 fragColor;\n" +
    "void main(){\n" +
    "fragColor = vertexColor;\n" +
    "gl_Position = vec4(vertexPosition, 1);\n" +
    "}";

let fragmentShaderText = "\n" +
    "precision mediump float;\n" +
    "varying vec3 fragColor;\n" +
    "\n" +
    "void main(){\n" +
    "\tgl_FragColor = vec4(fragColor, 1.0);\n" +
    "}";

let gl = initWebGL(canvas);      // инициализация контекста GL

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

let program = createProgram(gl, vertexShader, fragmentShader);

let vertexArray = [];

let mouseDownEventHandler = onmousedown.bind(null, vertexArray, canvas);


canvas.addEventListener("mousedown", ev => {
    mouseDownEventHandler(ev);
    draw(vertexArray);
});

draw(vertexArray);

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

function draw(vertexArray) {
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    /*    let vertexArray = [
            //  X,      Y,      Z,      R,      G,      B
            -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,
            0.0, 0.5, 0.5, 0.0, 1.0, 0.0,
            0.5, -0.5, 0.0, 0.0, 0.0, 1.0,

            -0.5, 0.5, 0.0, 0.0, 0.0, 1.0,
            0.0, -0.5, 0.5, 0.0, 1.0, 0.0,
            0.5, 0.5, 0.0, 1.0, 0.0, 0.0
        ];*/
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");

    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        false,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(positionAttribLocation);

    let colorAttribLocation = gl.getAttribLocation(program, "vertexColor");

    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        false,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);

    gl.drawArrays(gl.TRIANGLES, 0, vertexArray.length / 6);
}

function initWebGL(canvas) {
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

    gl.clearColor(255.0, 255.0, 255.0, 1.0);                      // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST);                               // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // очистить буфер цвета и буфер глубины.

    return gl;
}

function onmousedown(vertexArray, canvas, event) {
    let x = event.clientX;
    let y = event.clientY;

    let middle_X = canvas.width / 2;
    let middle_Y = canvas.height / 2;
    let rect = canvas.getBoundingClientRect();

    x = ((x - rect.left) - middle_X) / middle_X;
    y = (middle_Y - (y - rect.top)) / middle_Y;

    vertexArray.push(x, y, 0, Math.random(), Math.random(), Math.random());
}