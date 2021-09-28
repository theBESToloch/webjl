let canvas = document.getElementById("canvas");
let info = document.getElementById("info");
let additional = document.getElementById("additional");
let width = canvas.clientWidth;
let height = canvas.clientHeight;

canvas.width = width;
canvas.height = height;

let vertexShaderText = "\n" +
    "attribute vec3 vertexPosition;\n" +
    "attribute vec3 vertexColor;\n" +

    "uniform mat4 uPMatrix;\n" +
    "uniform mat4 uViewMatrix;\n" +

    "uniform vec4 uPosVec;\n" +

    "varying vec3 fragColor;\n" +

    "void main(){\n" +
    "fragColor = vertexColor;\n" +
    "gl_Position = uViewMatrix * vec4(vertexPosition, 1) + uPosVec;\n" +
    "//gl_Position = uViewMatrix * uPMatrix * vec4(vertexPosition, 1) + uPosVec;\n" +
    "}";

let fragmentShaderText = "\n" +
    "precision mediump float;\n" +
    "varying vec3 fragColor;\n" +
    "\n" +
    "void main(){\n" +
    "\tgl_FragColor = vec4(fragColor, 0.8);\n" +
    "}";

let gl = initWebGL(canvas, width, height);      // инициализация контекста GL

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

let program = createProgram(gl, vertexShader, fragmentShader);

gl.useProgram(program);

let positionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
gl.enableVertexAttribArray(positionAttribLocation);

let colorAttribLocation = gl.getAttribLocation(program, "vertexColor");
gl.enableVertexAttribArray(colorAttribLocation);

let uniformLocation = gl.getUniformLocation(program, "uPMatrix");
let uniformViewLocation = gl.getUniformLocation(program, "uViewMatrix");
let uniformPosLocation = gl.getUniformLocation(program, "uPosVec");

let vertexArray = [
    // задняя часть
    -0.5, -0.5, 0.5, 1, 0, 0,
    -0.5, 0.5, 0.5, 0, 1, 0,
    0.5, 0.5, 0.5, 0, 0, 1,
    0.5, -0.5, 0.5, 0, 0, 0,
    // лицевая часть
    -0.5, -0.5, -0.5, 0, 0, 1,
    -0.5, 0.5, -0.5, 0, 0, 0,
    0.5, 0.5, -0.5, 1, 0, 0,
    0.5, -0.5, -0.5, 0, 1, 0,
];

let vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

let indices = [
    //лицевая часть
    0, 1, 2,
    0, 3, 2,        //++
    //задняя часть
    4, 5, 6,
    4, 7, 6,        //++
    //левая часть
    1, 0, 4,
    1, 5, 4,        //++
    //правая часть
    3, 2, 6,
    3, 7, 6,        //++
    //верхняя часть
    2, 1, 5,
    2, 6, 5,        //++
    //нижняя часть
    3, 0, 4,
    3, 7, 4,        //++
];

// создание буфера индексов
let indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

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

let camera = {
    left: -5,
    right: 5,
    bottom: -5,
    top: 5,
    far: 5,
    near: -1,
}

let position = {
    x: 0,
    y: 0,
    z: 1,
}

let angles = new function () {
    this.dX = 0;
    this.dY = 0;
    this.dZ = 0;
    this.toString = () => {
        return `dx: ${this.dX} dy: ${this.dY} dz: ${this.dZ}`
    }
}

function getProjectionMatrix(camera) {
    return new Float32Array([
        2 * camera.near / (camera.right - camera.left), 0, (camera.right + camera.left) / (camera.right - camera.left), 0,
        0, 2 * camera.near / (camera.top - camera.bottom), (camera.top + camera.bottom) / (camera.top - camera.bottom), 0,
        0, 0, -(camera.far + camera.near) / (camera.far - camera.near), -(2 * camera.far * camera.near) / (camera.far - camera.near),
        0, 0, -1, 0
    ]);

}

function getPosition(position) {
    if (control.ArrowLeft) position.x -= 0.1;
    if (control.ArrowRight) position.x += 0.1;
    if (control.ArrowDown) position.z -= 0.1;
    if (control.ArrowUp) position.z += 0.1;
    return new Float32Array([position.x, position.y, position.z, 0]);

}

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
        0, 0, 0, 1
    ];

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
    return new Float32Array(newVar);
}

function draw() {
    gl.uniformMatrix4fv(uniformLocation, false, getProjectionMatrix(camera));
    gl.uniformMatrix4fv(uniformViewLocation, false, getViewMatrix());
    gl.uniform4fv(uniformPosLocation, getPosition(position));

    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
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

let control = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
}

canvas.addEventListener("keydown", (e) => control[e.key] = true);
canvas.addEventListener("keyup", (e) => control[e.key] = false);

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);

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

let dxinput = document.getElementById("dx");
let dyinput = document.getElementById("dy");
let dzinput = document.getElementById("dz");
dxinput.addEventListener("change", ev => angles.dX = ev.target.value);
dyinput.addEventListener("change", ev => angles.dY = ev.target.value);
dzinput.addEventListener("change", ev => angles.dZ = ev.target.value);


let callback = (timestamp) => {
    info.innerText = angles;
    draw();
    requestAnimationFrame(callback);
};
requestAnimationFrame(callback);
