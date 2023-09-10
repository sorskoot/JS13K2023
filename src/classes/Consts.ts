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

export const Waves = ['555', ' 0 ', ' 1 ', ' 2 ', ' 3 ', ' 4 '];

export const Formations = [
    `1  1  1`, //0
    `1  1  1
1  1  1
1  1  1`, //1
    `    1 1    
    2 2   
    3 3`, // 2
    `  1 1 1 1   
2 2 2 2 2
 3 3 3 3`, //3

    `11 11 11
22 22 22
33 33 33`, //4

    `22 22 22
11211211
33133133
11111111
11111111`, //5
];
