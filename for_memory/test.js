/*
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
    "gl_PointSize = 10.0;\n" +
    "}";

let fragmentShaderText = "\n" +
    "precision mediump float;\n" +
    "varying vec3 fragColor;\n" +
    "\n" +
    "void main(){\n" +
    "\tgl_FragColor = vec4(fragColor, 1.0);\n" +
    "}";

let gl = initWebGL(canvas, width, height);      // инициализация контекста GL

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");

    gl.vertexAttribPointer(
        positionAttribLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT,0 * Float32Array.BYTES_PER_ELEMENT);

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
    gl.drawArrays(gl.POINTS, 0, vertexArray.length / 6);
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
}*/

//мышка

let mouseDown = false;

let mousePosition = {
    x: null,
    y: null
}

function onMouseDown(e) {
    e.stopPropagation();
    mouseDown = true;
    mousePosition.x = e.offsetX;
    mousePosition.y = e.offsetY;
}

function onMouseUp(e) {
    e.stopPropagation();
    mouseDown = false;
}

function onMouseMove(e) {
    e.stopPropagation();
    if (!mouseDown) return;
    let delX = (e.offsetX - mousePosition.x) * 0.1;
    let delY = (e.offsetY - mousePosition.y) * 0.1;

    let cosX = Math.cos(angles.dX / 180 * Math.PI);
    let cosY = Math.cos(angles.dY / 180 * Math.PI);
    let cosZ = Math.cos(angles.dZ / 180 * Math.PI);
    let sinX = Math.sin(angles.dX / 180 * Math.PI);
    let sinY = Math.sin(angles.dY / 180 * Math.PI);
    let sinZ = Math.sin(angles.dZ / 180 * Math.PI);

    /*    angles.dX += (-delX * sinY * sinZ + delY * cosY * cosZ);
        angles.dY += (delX * cosX * cosZ - delY * sinX * cosZ);
        angles.dZ += (delX * sinX * sinY + delY * sinY * cosX);*/

    angles.dX += (-delX * cosY * sinZ + delY * cosY * cosZ);
    angles.dY += (delX * cosX * cosZ + delY * cosX * sinZ);
    angles.dZ += (-delX * sinX * cosY + delY * cosX * sinY);

    mousePosition = {
        x: e.offsetX,
        y: e.offsetY
    }
}

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);


function getViewMatrix() {
    let cosX = Math.cos(angles.dX / 180 * Math.PI);
    let cosY = Math.cos(angles.dY / 180 * Math.PI);
    let cosZ = Math.cos(angles.dZ / 180 * Math.PI);
    let sinX = Math.sin(angles.dX / 180 * Math.PI);
    let sinY = Math.sin(angles.dY / 180 * Math.PI);
    let sinZ = Math.sin(angles.dZ / 180 * Math.PI);
    let newVar = [
        cosY * cosZ, -cosY * sinZ, sinY, 0,
        sinX * sinY * cosZ + cosX * sinZ, -sinX * sinY * sinZ + cosX * cosZ, -sinX * cosY, 0,
        -cosX * sinY * cosZ + sinX * sinZ, cosX * sinY * sinZ + sinX * cosZ, cosX * cosY, 0,
        1, 1, 1, 1
    ];

    /*    let newVar = [
            cosX * cosY, cosX * sinY * sinZ - sinX * cosZ, cosX * sinY * cosZ + sinX * sinZ, 0,
            sinX * cosY, sinX * sinY * sinZ + cosX * cosZ, sinX * sinY * cosZ - cosX * sinZ, 0,
            -sinY, cosY * sinZ, cosY * cosZ, 0,
            0, 0, 0, 1
        ];*/


    let map = newVar.map((value) => value < 0.00001 ? 0 : value);
    additional.innerText = `cosX: ${cosX} cosY: ${cosY} cosZ ${cosZ} sinX: ${sinX} sinY: ${sinY} sinZ: ${sinZ}`;
    additional.append(document.createElement("br"));
    additional.append(map.slice(0, 4));
    additional.append(document.createElement("br"));
    additional.append(map.slice(4, 8));
    additional.append(document.createElement("br"));
    additional.append(map.slice(8, 12));
    additional.append(document.createElement("br"));
    additional.append(map.slice(12, 16));
    return newVar;
}


//-------------------------------------------------------------------------------------------
document.getElementById("dx").addEventListener("change", ev => angles.dX = ev.target.value);
document.getElementById("dy").addEventListener("change", ev => angles.dY = ev.target.value);
document.getElementById("dz").addEventListener("change", ev => angles.dZ = ev.target.value);


let angles = new function () {
    this.dX = 0;
    this.dY = 0;
    this.dZ = 0;
    this.toString = () => {
        return `dx: ${this.dX} dy: ${this.dY} dz: ${this.dZ}`
    }
}
info.innerText = angles;

//-------------------------------------------------------------------------------------------

let camera = {
    left: -1,
    right: 1,
    bottom: -1,
    top: 1,
    far: 1,
    near: -1,
}

function getProjectionMatrix(camera) {
    return new Float32Array([
        2 * camera.near / (camera.right - camera.left), 0, (camera.right + camera.left) / (camera.right - camera.left), 0,
        0, 2 * camera.near / (camera.top - camera.bottom), (camera.top + camera.bottom) / (camera.top - camera.bottom), 0,
        0, 0, -(camera.far + camera.near) / (camera.far - camera.near), -(2 * camera.far * camera.near) / (camera.far - camera.near),
        0, 0, -1, 0
    ]);
}