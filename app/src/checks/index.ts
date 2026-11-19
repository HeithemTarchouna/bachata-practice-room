// Measurements on the simulated dance. They run in plain Node (no browser), so they are fast enough to run on
// every change. Each one answers a question a viewer would ask: does anything pass through anything, do feet
// slide, does anything teleport.
import { frame, load, setTime, counts, noLoop } from "../engine";
import type { Shape } from "../engine";

type V = number[];
export interface Finding {
  /** How bad, in meters (overlap depth, slide distance) or meters per count (speed). */
  amount: number;
  /** The count at which it is worst. */
  at: number;
}
export type Findings = Record<string, Finding>;

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Shortest distance between two line segments, and where on each segment it occurs (0..1). */
export function segmentDistance(p1: V, q1: V, p2: V, q2: V): [number, number, number] {
  const d1 = [q1[0] - p1[0], q1[1] - p1[1], q1[2] - p1[2]];
  const d2 = [q2[0] - p2[0], q2[1] - p2[1], q2[2] - p2[2]];
  const r = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
  const a = dot(d1, d1),
    e = dot(d2, d2),
    f = dot(d2, r);
  let s: number, t: number;
  if (a < 1e-9 && e < 1e-9) {
    s = 0;
    t = 0;
  } else if (a < 1e-9) {
    s = 0;
    t = clamp01(f / e);
  } else {
    const c = dot(d1, r);
    if (e < 1e-9) {
      t = 0;
      s = clamp01(-c / a);
    } else {
      const b = dot(d1, d2),
        den = a * e - b * b;
      s = den !== 0 ? clamp01((b * f - c * e) / den) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp01(-c / a);
      } else if (t > 1) {
        t = 1;
        s = clamp01((b - c) / a);
      }
    }
  }
  const c1 = [p1[0] + d1[0] * s, p1[1] + d1[1] * s, p1[2] + d1[2] * s];
  const c2 = [p2[0] + d2[0] * t, p2[1] + d2[1] * t, p2[2] + d2[2] * t];
  return [dist(c1, c2), s, t];
}

interface Capsule {
  id: string;
  part: string;
  side: string;
  a: V;
  b: V;
  ra: number;
  rb: number;
}

/** The collision volumes of both bodies: every shape that names a body part, plus heads and hands. */
function capsules(shapes: Shape[]): Capsule[] {
  const caps: Capsule[] = shapes
    .filter((s) => (s.t === "c" || s.t === "x") && s.part)
    .map((s) => ({
      id: s.id,
      part: s.part!,
      side: s.side ?? "C",
      a: s.a as V,
      b: s.b as V,
      ra: s.t === "x" ? s.ra! : s.wa!,
      rb: s.t === "x" ? s.rb! : s.wb!,
    }));
  for (const h of shapes.filter((s) => s.t === "h"))
    caps.push({ id: h.id, part: "head", side: "C", a: h.p as V, b: h.p as V, ra: h.r!, rb: h.r! });
  for (const o of shapes.filter((s) => s.t === "o" && s.hand))
    caps.push({ id: o.id, part: "hand", side: o.side!, a: o.p as V, b: o.p as V, ra: o.r!, rb: o.r! });
  return caps;
}
const overlap = (a: Capsule | any, c: Capsule | any) => {
  const [d, s1, s2] = segmentDistance(a.a, a.b, c.a, c.b);
  return a.ra + (a.rb - a.ra) * s1 + (c.ra + (c.rb - c.ra) * s2) - d;
};
const isArm = (p: string) => p === "fore" || p === "upper";
const ARM_NAME: Record<string, string> = { hnd: "hand", fore: "forearm", upper: "upper arm" };

/** Run `visit` at evenly spaced moments of the loaded move. */
function sweep(stepsPerCount: number, visit: (t: number) => void) {
  const N = counts(),
    end = noLoop() ? N : N - 1e-6;
  for (let i = 0; i <= N * stepsPerCount; i++) {
    const t = Math.min(i / stepsPerCount, end);
    setTime(t);
    visit(t);
  }
}

/**
 * Everything that passes through something else during a move.
 * Keys starting with "IN" are the serious ones: an arm or hand inside the partner, or an arm stretched past
 * its real length. The rest are brushes between legs, skirt and limbs.
 */
export function collisions(move: number, mistake = false): Findings {
  load(move, mistake);
  const worst: Findings = {};
  const note = (key: string, amount: number, t: number) => {
    if (!worst[key] || worst[key].amount < amount)
      worst[key] = { amount: +amount.toFixed(3), at: Math.round(t * 20) / 20 };
  };
  sweep(20, (t) => {
    const { shapes } = frame();
    const caps = capsules(shapes);
    for (const id of ["l", "f"]) {
      // a dancer's own legs through each other
      const legs = caps.filter((c) => c.id === id && (c.part === "thigh" || c.part === "shin"));
      for (const a of legs)
        for (const c of legs) {
          if (a.side !== "L" || c.side !== "R" || (a.part === "thigh" && c.part === "thigh")) continue;
          const pen = overlap(a, c);
          if (pen > 0.012) note(`LEGS ${id} ${a.part}/${c.part}`, pen, t);
        }
      // a dancer's own arm through their own head
      const head = caps.find((c) => c.id === id && c.part === "head")!;
      for (const c of caps.filter((c) => c.id === id && (isArm(c.part) || c.part === "hand"))) {
        const pen = Math.max(c.ra, c.rb) + head.ra - segmentDistance(c.a, c.b, head.a, head.b)[0];
        if (pen > 0.005) note(`SELF ${id} ${c.part}/head`, pen, t);
      }
      // an arm drawn longer than an arm is: bones are 33 cm each
      for (const sd of ["L", "R"]) {
        const up = caps.find((c) => c.id === id && c.part === "upper" && c.side === sd)!;
        const fo = caps.find((c) => c.id === id && c.part === "fore" && c.side === sd)!;
        const over = dist(up.a, up.b) + dist(fo.a, fo.b) - 0.66;
        if (over > 0.03) note(`IN ${id} ${sd} arm STRETCHED`, over, t);
      }
    }
    // any part of an arm or hand inside the partner (1.5 cm of give for a resting hand)
    for (const [A, B] of [
      ["l", "f"],
      ["f", "l"],
    ]) {
      const arms = caps.filter((c) => c.id === A && ARM_NAME[c.part]);
      const torso = shapes
        .filter((s) => s.t === "c" && s.tg && s.id === B)
        .map((s) => ({ a: s.a, b: s.b, ra: s.wa, rb: s.wb, name: "body" }));
      const rest = caps
        .filter((c) => c.id === B && ["thigh", "shin", "neck", "head", "skirt"].includes(c.part))
        .map((c) => ({ ...c, name: c.part === "thigh" || c.part === "shin" ? "leg" : c.part }));
      for (const a of arms)
        for (const c of [...torso, ...rest]) {
          const pen = overlap(a, c);
          if (pen > 0.015) note(`IN ${A} ${a.side} ${ARM_NAME[a.part]} in ${B} ${c.name}`, pen, t);
        }
    }
    // everything else between the two dancers
    for (const a of caps.filter((c) => c.id === "l"))
      for (const c of caps.filter((c) => c.id === "f")) {
        if (a.part === "hnd" || c.part === "hnd" || (isArm(a.part) && isArm(c.part))) continue;
        if (a.part === "hand" && (isArm(c.part) || ["hand", "torso", "skirt"].includes(c.part))) continue;
        if (c.part === "hand" && (isArm(a.part) || ["hand", "torso"].includes(a.part))) continue;
        if (a.part === "fore" && (c.part === "torso" || c.part === "skirt")) continue;
        if (c.part === "fore" && a.part === "torso") continue;
        const pen = overlap(a, c);
        if (pen > 0.02) note(`${a.part}/${c.part}`, pen, t);
      }
  });
  return worst;
}

/** How far each dancer's feet slide along the floor while they are down, worst single count, in meters. */
export function footSliding(move: number): Record<"l" | "f", Finding> {
  load(move);
  const out: any = {};
  for (const who of ["l", "f"] as const) {
    let prev: any = null,
      worst = 0,
      at = 0;
    const perCount: Record<number, number> = {};
    sweep(40, (t) => {
      const f = frame();
      const P = who === "l" ? f.Pl : f.Pf;
      if (prev)
        for (const sd of ["L", "R"]) {
          const a = prev[sd],
            b = P[sd];
          if (a[1] < 0.004 && b[1] < 0.004) {
            const k = Math.floor(t);
            perCount[k] = (perCount[k] || 0) + Math.hypot(a[0] - b[0], a[2] - b[2]);
            if (perCount[k] > worst) {
              worst = perCount[k];
              at = k;
            }
          }
        }
      prev = { L: P.L, R: P.R };
    });
    out[who] = { amount: +worst.toFixed(3), at };
  }
  return out;
}

/** Speed limits in meters per count. Above these a body part is jumping, not moving. */
export const SPEED_LIMIT: Record<string, number> = { hand: 3.2, elbow: 3.6, foot: 3.2, head: 1.8 };

/** Body parts that move faster than a body can: teleports and snaps. */
export function jumps(move: number, stepsPerCount = 120): Findings {
  load(move);
  const worst: Findings = {};
  let prev: Record<string, V> | null = null;
  sweep(stepsPerCount, (t) => {
    const f = frame();
    const pts: Record<string, V> = {};
    for (const [id, P] of [
      ["l", f.Pl],
      ["f", f.Pf],
    ] as const) {
      for (const sd of ["L", "R"]) {
        pts[`${id} ${sd} hand`] = P.hands[sd];
        pts[`${id} ${sd} foot`] = P[sd];
        pts[`${id} ${sd} elbow`] = f.shapes.find((s) => s.id === id && s.part === "upper" && s.side === sd)!.b as V;
      }
      pts[`${id} head`] = f.shapes.find((s) => s.t === "h" && s.id === id)!.p as V;
    }
    if (prev)
      for (const k in pts) {
        const v = dist(prev[k], pts[k]) * stepsPerCount,
          kind = k.split(" ").pop()!;
        if (v > SPEED_LIMIT[kind] && (!worst[k] || worst[k].amount < v))
          worst[k] = { amount: +v.toFixed(1), at: +t.toFixed(2) };
      }
    prev = pts;
  });
  return worst;
}

/** Longest reach of a foot away from the hips, per dancer, in meters. A leg looks stretched above about 0.33. */
export function footReach(move: number): Record<"l" | "f", Finding> {
  load(move);
  const out: any = { l: { amount: 0, at: 0 }, f: { amount: 0, at: 0 } };
  sweep(40, (t) => {
    const f = frame();
    for (const [who, P] of [
      ["l", f.Pl],
      ["f", f.Pf],
    ] as const)
      for (const sd of ["L", "R"]) {
        const d = Math.hypot(P[sd][0] - P.c[0], P[sd][2] - P.c[1]);
        if (d > out[who].amount) out[who] = { amount: +d.toFixed(3), at: +t.toFixed(2) };
      }
  });
  return out;
}
