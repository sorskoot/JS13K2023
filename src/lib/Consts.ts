export const EPSILON = 1e-6;
export const PI = Math.PI;
export const TAU = 2 * PI;

export const identityMatrix = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);
export const offsetMatrix = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -2, 1, -5, 1,
]);
