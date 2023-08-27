export enum paletteIndex {
    black = 0,
    cyan = 1,
    darkCyan = 2,
    green = 3,
    yellow = 4,
    red = 5,
    darkRed = 6,
    brown = 7,
    orange = 8,
    gray = 9,
}

export const palette = [
    [0.0, 0.0, 0.0], // black
    [0x6e, 0xb8, 0xa8], // cyan
    [0x2a, 0x58, 0x4f], // dark cyan
    [0x74, 0xa3, 0x3f], // green
    [0xfc, 0xff, 0xc0], // yellow
    [0xc6, 0x50, 0x5a], // red
    [0x2f, 0x14, 0x2f], // dark red
    [0x77, 0x44, 0x48], // brown
    [0xee, 0x9c, 0x5d], // orange
    [0x74, 0x74, 0x74], // grey
];

export const cube = [
    -1, 1, 1, 0.625, 0, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, -1, 1, 0.375, 0,
    -1, 0, 0, -1, 1, -1, 0.625, 0.25, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0, 0, -1, -1, -1, -1,
    0.375, 0.25, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 1, 0, 0, 1, -1, 1, 0.375, 0.75, 1, 0, 0, 1,
    -1, -1, 0.375, 0.5, 1, 0, 0, 1, 1, 1, 0.625, 0.75, 0, 0, 1, -1, -1, 1, 0.375, 1, 0, 0,
    1, 1, -1, 1, 0.375, 0.75, 0, 0, 1, 1, -1, -1, 0.375, 0.5, 0, -1, 0, -1, -1, 1, 0.125,
    0.75, 0, -1, 0, -1, -1, -1, 0.125, 0.5, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, 1, 1,
    1, 0.625, 0.75, 0, 1, 0, 1, 1, -1, 0.625, 0.5, 0, 1, 0, -1, 1, 1, 0.625, 0, -1, 0, 0,
    -1, 1, -1, 0.625, 0.25, -1, 0, 0, -1, -1, -1, 0.375, 0.25, -1, 0, 0, -1, 1, -1, 0.625,
    0.25, 0, 0, -1, 1, 1, -1, 0.625, 0.5, 0, 0, -1, 1, -1, -1, 0.375, 0.5, 0, 0, -1, 1, 1,
    -1, 0.625, 0.5, 1, 0, 0, 1, 1, 1, 0.625, 0.75, 1, 0, 0, 1, -1, 1, 0.375, 0.75, 1, 0, 0,
    1, 1, 1, 0.625, 0.75, 0, 0, 1, -1, 1, 1, 0.625, 1, 0, 0, 1, -1, -1, 1, 0.375, 1, 0, 0,
    1, 1, -1, -1, 0.375, 0.5, 0, -1, 0, 1, -1, 1, 0.375, 0.75, 0, -1, 0, -1, -1, 1, 0.125,
    0.75, 0, -1, 0, -1, 1, -1, 0.875, 0.5, 0, 1, 0, -1, 1, 1, 0.875, 0.75, 0, 1, 0, 1, 1, 1,
    0.625, 0.75, 0, 1, 0,
];
