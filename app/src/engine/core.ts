// Small shared pieces: angles, interpolation, the footwork table and the builders used to write moves.
export const R = Math.PI / 180;
export const vec = (th) => {
  const t = th * R;
  return { f: [Math.sin(t), Math.cos(t)], r: [-Math.cos(t), Math.sin(t)] };
};
export const FW = {
  1: [0.06, -0.28, "P", null],
  2: [0.06, -0.06, "M", null],
  3: [0.28, -0.06, "P", null],
  4: [0.28, 0.16, "P", "M"],
  5: [0.28, -0.06, "M", null],
  6: [0.06, -0.06, "P", null],
  7: [0.06, -0.28, "M", null],
  8: [-0.16, -0.28, "M", "P"],
};
export const L0 = { x: -0.42, z: 0, th: 90 },
  F0 = { x: 0.42, z: 0, th: -90 };
export const two = [
    ["L", "R", "mid"],
    ["R", "L", "mid"],
  ],
  LP = { ...L0, fw: "place" };
export const KB = (c, fw) => K({ ...L0, fw }, { ...F0, fw }, two, c);
export const K = (l, f, h, cue) => ({ l: { mode: "basic", ...l }, f: { mode: "basic", ...f }, h, cue });
export const T = (o) => ({ ...o, mode: "turn" });
export const TP = (o) => ({ ...o, mode: "turn", drift: 1 });
export const TB = (o) => ({ ...o, mode: "turn", pvt: 1 });
export const B = [
  "Step to your left. Knees soft.",
  "Close the right foot.",
  "Step left again.",
  "Tap right: no weight, hip pops.",
  "Step to your right.",
  "Close the left foot.",
  "Step right again.",
  "Tap left: no weight.",
];
export const wrapDeg = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
export const lerp = (a, b, s) => a + (b - a) * s,
  lerp3 = (a, b, s) => [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)];
export const ease = (s) => (s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function mono(p0, p1, p2, p3, s) {
  const d0 = p1 - p0,
    d1 = p2 - p1,
    d2 = p3 - p2;
  let m1 = d0 * d1 <= 0 ? 0 : (d0 + d1) / 2,
    m2 = d1 * d2 <= 0 ? 0 : (d1 + d2) / 2;
  if (Math.abs(d1) < 1e-9) {
    m1 = 0;
    m2 = 0;
  } else {
    const a = m1 / d1,
      b = m2 / d1,
      h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      m1 = k * a * d1;
      m2 = k * b * d1;
    }
  }
  const s2 = s * s,
    s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p1 + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2 + (s3 - s2) * m2;
}
export function ik(A, Bp, len, dir) {
  const d = [Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]],
    dl = Math.hypot(...d) || 1e-6,
    u = d.map((x) => x / dl);
  const half = Math.min(dl / 2, len * 0.999),
    h = Math.sqrt(Math.max(0, len * len - half * half));
  const dot = dir[0] * u[0] + dir[1] * u[1] + dir[2] * u[2];
  let p = dir.map((x, i) => x - u[i] * dot);
  const pl = Math.hypot(...p) || 1;
  p = p.map((x) => x / pl);
  return [A[0] + (u[0] * dl) / 2 + p[0] * h, A[1] + (u[1] * dl) / 2 + p[1] * h, A[2] + (u[2] * dl) / 2 + p[2] * h];
}
export function tint(c, k) {
  let m;
  if (c.startsWith("#")) {
    const n = parseInt(c.slice(1, 7), 16);
    m = [n >> 16, (n >> 8) & 255, n & 255];
  } else m = c.match(/\d+/g).map(Number);
  return `rgb(${Math.min(255, Math.round(m[0] * k))},${Math.min(255, Math.round(m[1] * k))},${Math.min(255, Math.round(m[2] * k))})`;
}
