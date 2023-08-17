import process from 'process';
import fs from 'fs';

function readObj(path) {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const result = load(data);
        console.log(result);
    });
}

// Get command line arguments
var args = process.argv.slice(2);

if (args.length > 0) {
    // Call the function with parameter from commandline and store the result.
    readObj(args[0]);
} else {
    console.log('No argument provided');
}

function insertXYZ(array, x, y, z) {
    array.push(x);
    array.push(y);
    array.push(z);
}
function insertUV(array, u, v) {
    array.push(u);
    array.push(v);
}
function getX(array, index) {
    return array[index * 3];
}
function getY(array, index) {
    return array[index * 3 + 1];
}
function getZ(array, index) {
    return array[index * 3 + 2];
}
function getU(array, index) {
    return array[index * 2];
}
function getV(array, index) {
    return array[index * 2 + 1];
}
function getIndex(index) {
    return parseInt(index) - 1;
}
function insertVertex(dest, positions, texcoords, normals, vertstr) {
    const indicesStr = vertstr.split('/');
    const indexPos = getIndex(indicesStr[0]);
    const indexTex = getIndex(indicesStr[1]);
    const indexNor = getIndex(indicesStr[2]);

    dest.push(getX(positions, indexPos));
    dest.push(getY(positions, indexPos));
    dest.push(getZ(positions, indexPos));

    dest.push(getU(texcoords, indexTex));
    dest.push(getV(texcoords, indexTex));

    dest.push(getX(normals, indexNor));
    dest.push(getY(normals, indexNor));
    dest.push(getZ(normals, indexNor));
}
function load(obj) {
    let dest = [];
    let positions = [];
    let texcoords = [];
    let normals = [];

    const lines = obj.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].split(' ');

        if (line[0] == 'vt') {
            insertUV(texcoords, parseFloat(line[1]), parseFloat(line[2]));
        } else if (line[0] == 'vn') {
            insertXYZ(
                normals,
                parseFloat(line[1]),
                parseFloat(line[2]),
                parseFloat(line[3])
            );
        } else if (line[0] == 'v') {
            insertXYZ(
                positions,
                parseFloat(line[1]),
                parseFloat(line[2]),
                parseFloat(line[3])
            );
        } else if (line[0] == 'f') {
            insertVertex(dest, positions, texcoords, normals, line[1]);
            insertVertex(dest, positions, texcoords, normals, line[2]);
            insertVertex(dest, positions, texcoords, normals, line[3]);
        }
    }
    return JSON.stringify(dest);
}
