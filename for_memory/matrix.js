let m = {
    transposition4: (mat4) => {
        let size = 4;
        let mat = [];
        for (let j = 0; j < size; j++) {
            for (let i = 0; i < size; i++) {
                mat[j * size + i] = mat4[i * size + j];
            }
        }
        return mat;
    },
    multiple: (mat4, number) => {
        return mat4.map(value => value * number);
    },
    reverse4: (mat4) => {
        let size = 4;
        let revMat = [];
        for (let j = 0; j < size; j++) {
            for (let i = 0; i < size; i++) {
                revMat.push(m.determinant3(m.minor4(mat4, i, j)));
            }
        }
        return m.multiple(m.transposition4(revMat), 1 / m.determinant4(mat4));
    },
    determinant4: (mat4) => {
        return mat4[0] * m.determinant3(m.minor4(mat4, 0, 0)) -
            mat4[1] * m.determinant3(m.minor4(mat4, 1, 0)) +
            mat4[2] * m.determinant3(m.minor4(mat4, 2, 0)) -
            mat4[3] * m.determinant3(m.minor4(mat4, 3, 0));
    },
    determinant3: (mat3) => {
        return mat3[0] * mat3[4] * mat3[8] +
            mat3[1] * mat3[5] * mat3[6] +
            mat3[3] * mat3[7] * mat3[2] -
            mat3[2] * mat3[4] * mat3[6] -
            mat3[1] * mat3[3] * mat3[8] -
            mat3[5] * mat3[7] * mat3[0];
    },
    minor4: (mat4, _i, _j) => {
        let size = 4;
        let mat3 = [];
        for (let j = 0; j < size; j++) {
            for (let i = 0; i < size; i++) {
                if (i !== _i && j !== _j) {
                    mat3.push(mat4[j * size + i]);
                }
            }
        }
        return mat3;
    },
    crossVec3: (a, b) => {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    },
    subtractVec3: (a, b) => {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },
    normalizeVec3: (v) => {
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // проверяем, что мы не делим на 0
        if (length > 0.00001) {
            return [v[0] / length, v[1] / length, v[2] / length];
        } else {
            return [0, 0, 0];
        }
    }
};

let distortions = {
    lookAt: (cameraPosition, target, up) => {
        let zAxis = m.normalizeVec3(m.subtractVec3(cameraPosition, target));
        let xAxis = m.normalizeVec3(m.crossVec3(up, zAxis));
        let yAxis = m.normalizeVec3(m.crossVec3(zAxis, xAxis));

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0], cameraPosition[1], cameraPosition[2], 1,
        ];
    },
    projection: (camera) => {

        let r = camera.right, l = camera.left, b = camera.bottom,
            t = camera.top, n = camera.near, f = camera.far;

        return new Float32Array([
            2 * n / (r - l),    0,                  (r + l) / (r - l),  0,
            0,                  2 * n / (t - b),    (t + b) / (t - b),  0,
            0,                  0,                  -(f + n) / (f - n), -2 * f * n / (f - n),
            0,                  0,                  -1,                 0
        ])
    }
}