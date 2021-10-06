let vertexArray = [
    // задняя часть
    -0.25, -0.25, 0.25, 1, 0, 0,
    -0.25, 0.25, 0.25, 0, 1, 0,
    0.25, 0.25, 0.25, 0, 0, 1,
    0.25, -0.25, 0.25, 0, 0, 0,
    // лицевая часть
    -0.25, -0.25, -0.25, 0, 0, 1,
    -0.25, 0.25, -0.25, 0, 0, 0,
    0.25, 0.25, -0.25, 1, 0, 0,
    0.25, -0.25, -0.25, 0, 1, 0,
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

let indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

let camera = {
    left: -1,
    right: 1,
    bottom: -1,
    top: 1,
    far: 3,
    near: 1,
    fieldOfViewInRadians: Math.PI * 0.4,
    aspectRatio: 1
}

function getProjectionMatrix(camera) {
    let factor = 1.0 / Math.tan(camera.fieldOfViewInRadians / 2);
    let rangeInv = 1 / (camera.near - camera.far);

    return new Float32Array([
        factor / camera.aspectRatio, 0, 0, 0,
        0, factor, 0, 0,
        0, 0, (camera.near + camera.far) * rangeInv, -1,
        0, 0, camera.near * camera.far * rangeInv * 2, 0
    ]);

    let r = camera.right, l = camera.left, b = camera.bottom,
        t = camera.top, n = camera.near, f = camera.far;

    return new Float32Array([
        2 * n / (r - l),    0,                  (r + l) / (r - l),  0,
        0,                  2 * n / (t - b),    (t + b) / (t - b),  0,
        0,                  0,                  -(f + n) / (f - n), -(2 * f * n) / (f - n),
        0,                  0,                  -1,                 0
    ]);
}

let position = {
    x: 0,
    y: -0.1,
    z: 0,
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // проверяем, что мы не делим на 0
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function lookAt(cameraPosition, target, up) {
    let zAxis = normalize(
        subtractVectors(cameraPosition, target));
    let xAxis = normalize(cross(up, zAxis));
    let yAxis = normalize(cross(zAxis, xAxis));

    return [
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0], cameraPosition[1], cameraPosition[2], 1,
    ];
}

function getPosition() {
    if (control.ArrowLeft) position.x -= 0.1;
    if (control.ArrowRight) position.x += 0.1;
    if (control.ArrowDown) position.z -= 0.1;
    if (control.ArrowUp) position.z += 0.1;
}

function transposition(mat1) {
    let size = 4;
    let mat = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            mat[j * size + i] = mat1[i * size + j];
        }
    }
    return mat;
}

function MultiplyMatrix(A, B) {
    let C = [];
    for (let k = 0; k < 4; k++) {
        for (let i = 0; i < 4; i++) {
            let t = 0;
            for (let j = 0; j < 4; j++) t += A[i * 4 + j] * B[j + k * 4];
            C[i + k * 4] = t;
        }
    }
    return C;
}

function draw() {

    let projectionMatrix = transposition(getProjectionMatrix(camera));
    let transposition1 = transposition(lookAt(
        [position.x, position.y, position.z],
        [0, 0, 0],
        [0, 1, 0]));

    gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(transposition1));
    gl.uniformMatrix4fv(uniformPerLocation, false, new Float32Array(projectionMatrix));

    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

let control = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
}
document.addEventListener("keydown", (e) => control[e.key] = true);
document.addEventListener("keyup", (e) => control[e.key] = false);


let callback = () => {
    animate();
    getPosition();
    draw();
    requestAnimationFrame(callback);
};
requestAnimationFrame(callback);

let ticket = 0;
function animate() {
    let r = 0.5;
    position.x = r * Math.cos(ticket * Math.PI / 180);
    position.z = r * Math.sin(ticket * Math.PI / 180);
    ticket++;
}