export enum paletteIndex {
    black = 0,
    cyan = 1,
    darkCyan = 2,
    green = 3,
    yellow = 4,
    red = 5,
    darkGray = 6,
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
    [0x44, 0x44, 0x44], // dark gray
    [0x77, 0x44, 0x48], // brown
    [0xee, 0x9c, 0x5d], // orange
    [0x74, 0x74, 0x74], // grey
];
// prettier-ignore
export const Waves = [
' D ', 
' 0 ', 
' 0 ', 
' 1 ', 
' 8 ',
'A0A',
'A1A',
' 9 ',
'B9B',
'B2B', 
'C3C', 
' 4 ',
'C4C',
' 5 ',
'3C3',
'949',
'787',
' 5 ',
'727',
'5 5',
'767',
'666'];

// prettier-ignore
export const Formations = [
`1  11  1

1  11  1
`,//0 
`   11   
  1  1  
 1    1 `, //1
`1  11  1
1 1  1 1
1  11  1`, //2
`    2 2
    1 1
   3 3`, // 3
` 2 2 2 2
1 1 1 1 1
 3 3 3 3`, //4

    `22 22 22
11 11 11
33 33 33`, //5

    `22 22 22
11211211
33133133
11111111
11111111`, //6
    `      22
     211
    2111
   21111`, // 7
` 2    2 
 1    1 `, // 8
 ` 2    2 
 1 33 1 `, // 9
 `      2 `, // A
`      2 
      1 `, // B
`   3  3 `, // C
`  1  1  


  1  1  `, //D
];
