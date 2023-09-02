import * as fs from 'fs';

export const cube = new Float32Array([
    -1, 1, 1, 0.625, 0, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, -1, 1, 0.375, 0, -1, 0, 0, -1, 1, -1, 0.625,
    0.25, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0, 0, -1, -1, -1, -1, 0.375, 0.25, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 1, 0, 0,
    1, -1, 1, 0.375, 0.75, 1, 0, 0, 1, -1, -1, 0.375, 0.5, 1, 0, 0, 1, 1, 1, 0.625, 0.75, 0, 0, 1, -1, -1, 1, 0.375, 1,
    0, 0, 1, 1, -1, 1, 0.375, 0.75, 0, 0, 1, 1, -1, -1, 0.375, 0.5, 0, -1, 0, -1, -1, 1, 0.125, 0.75, 0, -1, 0, -1, -1,
    -1, 0.125, 0.5, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, 1, 1, 1, 0.625, 0.75, 0, 1, 0, 1, 1, -1, 0.625, 0.5, 0, 1,
    0, -1, 1, 1, 0.625, 0, -1, 0, 0, -1, 1, -1, 0.625, 0.25, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, 1, -1,
    0.625, 0.25, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 1, 0,
    0, 1, 1, 1, 0.625, 0.75, 1, 0, 0, 1, -1, 1, 0.375, 0.75, 1, 0, 0, 1, 1, 1, 0.625, 0.75, 0, 0, 1, -1, 1, 1, 0.625, 1,
    0, 0, 1, -1, -1, 1, 0.375, 1, 0, 0, 1, 1, -1, -1, 0.375, 0.5, 0, -1, 0, 1, -1, 1, 0.375, 0.75, 0, -1, 0, -1, -1, 1,
    0.125, 0.75, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, -1, 1, 1, 0.875, 0.75, 0, 1, 0, 1, 1, 1, 0.625, 0.75, 0, 1,
    0,
]);

// Function to write the binary file
function writeToBinaryFile(data) {
    var buffer = Buffer.allocUnsafe(data.length * 4); // 4 bytes per float

    for (var i = 0; i < data.length; i++) {
        buffer.writeFloatLE(data[i], i * 4);
    }

    fs.writeFileSync('CubeModel.bin', buffer);
}

writeToBinaryFile(cube);
