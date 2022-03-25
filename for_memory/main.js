let vertexArray = [
    // задняя часть
    -0.25, -0.25, 0.25, 0, 0, 1,
    -0.25, 0.25, 0.25, 1, 1, 0,
    0.25, 0.25, 0.25, 1, 0, 1,
    0.25, -0.25, 0.25, 0, 0, 1,
    // лицевая часть
    -0.25, -0.25, -0.25, 0, 0, 1,
    -0.25, 0.25, -0.25, 1, 0, 0,
    0.25, 0.25, -0.25, 1, 0, 0,
    0.25, -0.25, -0.25, 0, 0, 1,
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
    far: 99999999,
    near: 1,
    fieldOfViewInRadians: Math.PI * 0.4,
    aspectRatio: width / height,

    position: {
        x: 0,
        y: 0,
        z: 0,
    }
}

function draw() {
    let projectionMatrix = distortions.projection(camera);
/*    let lookat = distortions.lookAt(
        [camera.position.x, camera.position.y, camera.position.z],
        [0, 0, 0],
        [0, 1, 0]);*/

    gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(projectionMatrix));
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
    draw();
    requestAnimationFrame(callback);
};

requestAnimationFrame(callback);

let ticket = 0;
let r = 1;

function animate() {
    if (control.ArrowDown) r -= 0.1;
    if (control.ArrowUp) r += 0.1;
    if (control.ArrowLeft) camera.position.y += 0.1;
    if (control.ArrowRight) camera.position.y -= 0.1;

    camera.position.x = r * Math.cos(ticket * Math.PI / 180);
    camera.position.z = r * Math.sin(ticket * Math.PI / 180);
    ticket += 0.5;
}