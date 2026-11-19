// Cleans raw pose-tracking data (from extract_poses.py): drops bad detections, fills short gaps, smooths.
import { tint } from "../engine/core";
export { tint };
export function cleanMotion(obj) {
  const F = obj.frames,
    n = F.length,
    med = (a) => {
      const b = a.slice().sort((x, y) => x - y);
      return b.length ? b[b.length >> 1] : 0;
    };
  const out = F.map((f) => ({ t: f.t, p: [null, null] }));
  let all = [],
    floor = [];
  for (const sl of [0, 1]) {
    const hs = F.map((f) => {
      const k = f.p[sl];
      if (!k) return 0;
      const ys = k.filter((q) => q[2] > 0.3).map((q) => q[1]);
      return ys.length >= 6 ? Math.max(...ys) - Math.min(...ys) : 0;
    });
    const mh = med(hs.filter((h) => h > 0)),
      okF = hs.map((h) => h > mh * 0.62);
    const J = [];
    for (let j = 0; j < 17; j++) {
      const x = new Array(n).fill(null),
        y = new Array(n).fill(null);
      for (let i = 0; i < n; i++) {
        const k = F[i].p[sl];
        if (okF[i] && k && k[j] && k[j][2] > 0.35) {
          x[i] = k[j][0];
          y[i] = k[j][1];
        }
      }
      // drop single-frame jumps
      for (let i = 1; i < n - 1; i++)
        if (x[i] != null && x[i - 1] != null && x[i + 1] != null) {
          const d1 = Math.hypot(x[i] - x[i - 1], y[i] - y[i - 1]),
            d2 = Math.hypot(x[i + 1] - x[i - 1], y[i + 1] - y[i - 1]);
          if (d1 > mh * 0.18 && d2 < d1 * 0.5) {
            x[i] = null;
            y[i] = null;
          }
        }
      // fill short gaps
      let last = -1;
      for (let i = 0; i < n; i++) {
        if (x[i] == null) continue;
        if (last >= 0 && i - last > 1 && i - last <= 9)
          for (let k = last + 1; k < i; k++) {
            const u = (k - last) / (i - last);
            x[k] = x[last] + (x[i] - x[last]) * u;
            y[k] = y[last] + (y[i] - y[last]) * u;
          }
        last = i;
      }
      // smooth
      const W5 = [1, 2, 3, 2, 1],
        sx = x.slice(),
        sy = y.slice();
      for (let i = 0; i < n; i++) {
        if (x[i] == null) continue;
        let a = 0,
          b = 0,
          w = 0;
        for (let k = -2; k <= 2; k++) {
          const m = i + k;
          if (m < 0 || m >= n || x[m] == null) continue;
          a += x[m] * W5[k + 2];
          b += y[m] * W5[k + 2];
          w += W5[k + 2];
        }
        sx[i] = a / w;
        sy[i] = b / w;
      }
      J.push([sx, sy]);
    }
    for (let i = 0; i < n; i++) {
      const kp = J.map((q) => (q[0][i] == null ? [0, 0, 0] : [q[0][i], q[1][i], 1])),
        cnt = kp.filter((q) => q[2]).length;
      if (cnt >= 8) {
        out[i].p[sl] = kp;
        for (const q of kp) if (q[2]) all.push(q);
        for (const j of [15, 16]) if (kp[j][2]) floor.push(kp[j][1]);
      }
    }
  }
  if (!all.length) throw new Error("empty");
  const xs = all.map((q) => q[0]).sort((a, b) => a - b),
    ys = all.map((q) => q[1]).sort((a, b) => a - b),
    pc = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
  let x0 = pc(xs, 0.01),
    x1 = pc(xs, 0.99),
    y0 = pc(ys, 0.01),
    y1 = pc(ys, 0.99);
  const px = (x1 - x0) * 0.18 + 20,
    py = (y1 - y0) * 0.16 + 20;
  floor.sort((a, b) => a - b);
  return {
    ...obj,
    frames: out,
    view: { x0: x0 - px, x1: x1 + px, y0: y0 - py * 1.3, y1: y1 + py * 0.6 },
    floorY: floor.length ? pc(floor, 0.9) : y1,
  };
}
