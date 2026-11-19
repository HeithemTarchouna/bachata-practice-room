// The teaching marks drawn around the dancers: floor grid, weight shadows, the next footprint, turn arcs,
// the gold arrow for the leader's left hand, rings on joined hands, and the little map in POV.
import { counts, keyStates, noLoop, poseAt, time } from "../engine";
import type { Frame } from "../engine";
import { vec } from "../engine/core";
import type { Camera } from "./camera";
import type { StageColors } from "./stage";

type Ctx = CanvasRenderingContext2D;
type V = number[];
export interface GuideInput {
  /** Arrows, footprints and arcs on or off. */
  on: boolean;
  /** Colour used for the leader's marks (red in the "common mistake" version). */
  lead: string;
}

const FONT = '700 13px "Atkinson Hyperlegible", system-ui, sans-serif';

/** Project a 3D path to the screen. Returns null when any part of it is behind the camera. */
function path(cam: Camera, pts: V[]): number[][] | null {
  const out = pts.map((p) => cam.project(p));
  return out.some((q) => q[2] < 0) ? null : out;
}
function stroke(ctx: Ctx, pp: number[][], color: string, width: number, dash: number[] = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  pp.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.stroke();
  ctx.setLineDash([]);
}
function arrowHead(ctx: Ctx, a: number[], b: number[], color: string, size: number) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = Math.hypot(dx, dy) || 1,
    ux = dx / l,
    uy = dy / l;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(b[0] + ux * size, b[1] + uy * size);
  ctx.lineTo(b[0] - uy * size * 0.8, b[1] + ux * size * 0.8);
  ctx.lineTo(b[0] + uy * size * 0.8, b[1] - ux * size * 0.8);
  ctx.closePath();
  ctx.fill();
}

/** Everything that lies on the floor. Drawn underneath the dancers. */
export function drawFloor(ctx: Ctx, cam: Camera, frame: Frame, g: GuideInput, colors: StageColors) {
  const { Pl, Pf } = frame,
    tgt = cam.target;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // grid, fading with distance from the couple
  ctx.strokeStyle = colors.floor;
  ctx.lineWidth = 1;
  const gx = Math.round(tgt[0] / 0.25),
    gz = Math.round(tgt[1] / 0.25);
  const fade = (x: number, z: number) => Math.min(1, Math.max(0, 1.25 - Math.hypot(x - tgt[0], z - tgt[1]) / 1.45));
  const seg = (a: V, b: V, alpha: number) => {
    if (alpha <= 0.02) return;
    const pp = path(cam, [a, b]);
    if (!pp) return;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(pp[0][0], pp[0][1]);
    ctx.lineTo(pp[1][0], pp[1][1]);
    ctx.stroke();
  };
  for (let i = -8; i <= 8; i++)
    for (let j = -8; j < 8; j++) {
      const x = (gx + i) * 0.25,
        z = (gz + i) * 0.25,
        a = (gz + j) * 0.25,
        b = (gx + j) * 0.25;
      seg([x, 0, a], [x, 0, a + 0.25], fade(x, a + 0.125));
      seg([b, 0, z], [b + 0.25, 0, z], fade(b + 0.125, z));
    }
  ctx.globalAlpha = 1;

  // a tinted disc under the foot that carries the weight
  for (const [P, color] of [
    [Pl, g.lead],
    [Pf, colors.follow],
  ] as const) {
    const f = P.wL ? P.L : P.R,
      ring: V[] = [];
    for (let i = 0; i <= 18; i++)
      ring.push([
        f[0] + P.v.f[0] * 0.05 + Math.cos((i / 18) * 6.283) * 0.1,
        0.002,
        f[2] + P.v.f[1] * 0.05 + Math.sin((i / 18) * 6.283) * 0.1,
      ]);
    const pp = path(cam, ring);
    if (!pp) continue;
    ctx.beginPath();
    pp.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (!g.on) return;

  // turn arcs: who turns during this count, and which way
  const t = time();
  for (const [P, color, who, other] of [
    [Pl, g.lead, "l", Pf.c],
    [Pf, colors.follow, "f", Pl.c],
  ] as const) {
    const d = poseAt(t + 1, who, other).th - P.th;
    if (Math.abs(d) <= 25) continue;
    const pts: V[] = [];
    for (let i = 0; i <= 16; i++) {
      const v = vec(P.th + (d * i) / 16);
      pts.push([P.c[0] + v.f[0] * 0.4, 0.01, P.c[1] + v.f[1] * 0.4]);
    }
    const pp = path(cam, pts);
    if (pp) {
      stroke(ctx, pp, color, 3.5);
      arrowHead(ctx, pp[pp.length - 2], pp[pp.length - 1], color, 9);
    }
  }

  // the leader's next step: an outlined footprint with L or R (dashed for a tap, which takes no weight)
  const N = counts(),
    k0 = noLoop() ? Math.min(Math.floor(t), N - 1) : Math.floor(t) % N,
    B = keyStates()[k0 + 1].l;
  const tap = B.tap,
    sd = tap ? (B.wL ? "R" : "L") : B.wL ? "L" : "R",
    f = B[sd],
    bv = vec(B.th),
    cur = Pl[sd];
  const print: V[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * 6.283,
      u = 0.06 + Math.cos(a) * 0.115,
      w = Math.sin(a) * 0.05;
    print.push([f[0] + bv.f[0] * u + bv.r[0] * w, 0.004, f[2] + bv.f[1] * u + bv.r[1] * w]);
  }
  const pp = path(cam, print);
  if (!pp) return;
  if (!tap) {
    ctx.fillStyle = g.lead;
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    pp.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  stroke(ctx, pp, g.lead, 2.5, tap ? [5, 4] : []);
  if (Math.hypot(f[0] - cur[0], f[2] - cur[2]) > 0.07) {
    const way = path(cam, [
      [cur[0], 0.004, cur[2]],
      [f[0], 0.004, f[2]],
    ]);
    if (way) {
      stroke(ctx, way, g.lead, 2);
      arrowHead(ctx, way[0], way[1], g.lead, 6);
    }
  }
  const q = cam.project([f[0] + bv.f[0] * 0.06, 0.004, f[2] + bv.f[1] * 0.06]);
  if (q[2] > 0) {
    const text = sd + (tap ? " tap" : "");
    ctx.font = FONT;
    const tw = ctx.measureText(text).width + 12,
      x = q[0] - tw / 2,
      y = q[1] + Math.max(14, 0.1 * cam.pixelsPerMeter(q[2]));
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = g.lead;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, tw, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = g.lead;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, q[0], y + 10.5);
  }
}

/** Marks drawn on top of the dancers. */
export function drawOverlay(ctx: Ctx, cam: Camera, frame: Frame, g: GuideInput, colors: StageColors) {
  const { Pl, Pf } = frame;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // gold arrow: where the leader's left hand travels during this count
  if (g.on) {
    const t = time(),
      pts: V[] = [];
    for (let i = 0; i <= 10; i++) pts.push((poseAt(t + i / 10, "l", Pf.c).hands as any).L);
    let len = 0;
    for (let i = 1; i < pts.length; i++)
      len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    const pp = len >= 0.12 ? path(cam, pts) : null;
    if (pp) {
      stroke(ctx, pp, colors.join, 4);
      arrowHead(ctx, pp[pp.length - 2], pp[pp.length - 1], colors.join, 10);
    }
  }

  // a ring around each pair of joined hands
  for (const sd of ["L", "R"]) {
    if (!Pl.joined[sd]) continue;
    const q = cam.project(Pl.hands[sd]);
    if (q[2] < 0) continue;
    ctx.strokeStyle = colors.join;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(q[0], q[1], Math.max(4, Math.min(60, 0.06 * cam.pixelsPerMeter(q[2]))), 0, 6.283);
    ctx.stroke();
  }

  // POV: a small map, so you still know where she is when she leaves your view
  if (cam.pov) {
    const m = 80,
      x0 = cam.width - m - 12,
      y0 = cam.height - m - 56,
      cx = x0 + m / 2,
      cy = y0 + m / 2 + 8,
      sc = 36,
      lv = vec(Pl.headTh);
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.floor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, y0, m, m, 10);
    ctx.fill();
    ctx.stroke();
    const at = (p: V) => {
      const dx = p[0] - Pl.c[0],
        dz = p[1] - Pl.c[1];
      return [cx + (dx * lv.r[0] + dz * lv.r[1]) * sc, cy - (dx * lv.f[0] + dz * lv.f[1]) * sc];
    };
    for (const [P, color] of [
      [Pl, g.lead],
      [Pf, colors.follow],
    ] as const) {
      const p = at(P.c),
        q = at([P.c[0] + P.v.f[0] * 0.25, P.c[1] + P.v.f[1] * 0.25]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, 6.283);
      ctx.fill();
    }
  }
}
