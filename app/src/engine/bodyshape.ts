// Body sizes and the torso outline. Drawing, arm placement and the collision checks all read these.
import { vec, lerp, clamp } from "./core";
export const FS = 0.082,
  LEG = 0.455; // half the distance between the feet when standing, and the length of thigh and shin
export const DIMS = {
  l: {
    shW: 0.195,
    hipW: 0.095,
    head: 0.1,
    neck: 0.044,
    thigh: [0.076, 0.054],
    shin: [0.052, 0.034],
    upper: [0.048, 0.04],
    fore: [0.038, 0.03],
    hand: 0.029,
    torso: [0.078, 0.085],
  },
  f: {
    shW: 0.138,
    hipW: 0.095,
    head: 0.095,
    neck: 0.037,
    thigh: [0.07, 0.048],
    shin: [0.045, 0.029],
    upper: [0.036, 0.03],
    fore: [0.029, 0.023],
    hand: 0.025,
    torso: [0.064, 0.072],
  },
};
// Torso outline per dancer: [height 0..1 from hips to shoulders, half width, depth radius, how far forward]. Drawn by body(), and
// used by bodyGap() so hands and arms know where the partner's surface really is.
export const PROFS = {
  l: [
    [0, 0.092, 0.08, 0],
    [0.16, 0.095, 0.077, 0],
    [0.36, 0.095, 0.072, 0],
    [0.56, 0.105, 0.078, 0.004],
    [0.78, 0.122, 0.083, 0.006],
    [0.92, 0.138, 0.074, 0],
    [1, 0.146, 0.06, 0],
  ],
  f: [
    [0, 0.085, 0.086, 0],
    [0.18, 0.078, 0.08, 0],
    [0.38, 0.052, 0.062, 0],
    [0.52, 0.058, 0.064, 0.004],
    [0.7, 0.074, 0.073, 0.015],
    [0.84, 0.084, 0.06, 0.008],
    [0.94, 0.098, 0.05, 0],
    [1, 0.104, 0.046, 0],
  ],
};
// How deep is point q inside a dancer's torso (plus clear of room)? Returns null if outside, else [depth, nx, nz] with the way out.
// B = {c,th} of that dancer. Each height is a flat bar with round ends, as drawn.
export function bodyGap(q, B, who, clear) {
  if (q[1] < 0.55 || q[1] > 1.5) return null;
  const v = vec(B.th),
    u = (q[1] - 0.9) / 0.48,
    uc = clamp(u, 0, 1),
    cx = B.ch ? lerp(B.c[0], B.ch[0], uc) : B.c[0],
    cz = B.ch ? lerp(B.c[1], B.ch[1], uc) : B.c[1]; // the torso leans from hips to chest
  const dx = q[0] - cx,
    dz = q[2] - cz,
    xl = dx * v.r[0] + dz * v.r[1],
    xd = dx * v.f[0] + dz * v.f[1];
  let h,
    r,
    fw = 0;
  if (u < 0) {
    if (who === "f") {
      h = 0;
      r = lerp(0.178, 0.2, clamp(-u / 0.7, 0, 1));
    } else {
      h = 0.09;
      r = 0.085;
    }
  } // below the hips: her skirt, his thighs
  else {
    const PR = PROFS[who];
    let i = 0;
    const uu = Math.min(u, 1);
    while (i < PR.length - 2 && PR[i + 1][0] < uu) i++;
    const A = PR[i],
      C = PR[i + 1],
      k = clamp((uu - A[0]) / (C[0] - A[0]), 0, 1);
    h = lerp(A[1], C[1], k);
    r = lerp(A[2], C[2], k);
    fw = lerp(A[3], C[3], k);
    if (u > 1) {
      const k2 = clamp((u - 1) / 0.25, 0, 1);
      h *= 1 - k2 * 0.8;
      r = lerp(r, 0.05, k2);
    }
  } // above the shoulders it narrows to the neck
  const ex = Math.abs(xl) > h ? xl - Math.sign(xl) * h : 0,
    ez = xd - fw,
    d = Math.hypot(ex, ez),
    R = r + clear;
  if (d >= R) return null;
  let nl = ex,
    nd = ez;
  if (d < 1e-4) {
    nl = 0;
    nd = xd >= fw ? 1 : -1;
  } else {
    nl /= d;
    nd /= d;
  }
  return [R - d, v.r[0] * nl + v.f[0] * nd, v.r[1] * nl + v.f[1] * nd];
}
