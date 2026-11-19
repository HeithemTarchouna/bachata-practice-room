// Baking: compute a move's motion once, at a fixed rate, then smooth it over TIME.
//
// Why: solving each instant on its own (hand targets, reach limits, elbow placement) can flip between two
// equally good answers from one instant to the next. On screen that is a teleport or a snap. A solver that
// only sees one instant cannot prevent that. Here the whole move is sampled, each joint's path is filtered so
// it cannot jump, and playback reads the filtered paths.
import { couple, counts, noLoop, setTime, time, setHandPrior } from "./sim";
import { body } from "./figure";
import type { Shape } from "./shapes";

type V = number[];
const SIDES = ["L", "R"] as const;
const TAU = 2 * Math.PI;

/** Smoothing width per channel, in counts (standard deviation of the blur). Feet stay crisp so steps still land on the beat. */
const BLUR: Record<string, number> = {
  hand: 0.075,
  swivel: 0.17,
  foot: 0.03,
  hips: 0.045,
  look: 0.05,
  axis: 0.03,
  ref: 0,
};
/** Channels that hold one angle instead of a point. */
const ANGLE = new Set(["swivel"]);

export interface Track {
  /** Samples per count. */
  rate: number;
  loop: boolean;
  /** Number of samples. */
  n: number;
  /** channel name -> one value per sample, e.g. "l hand L" -> [x, y, z]. */
  ch: Record<string, V[]>;
}

export interface BakeJob {
  track: Track;
  next: number;
  done: boolean;
  /** Per arm: the reference direction the elbow angle is measured from, carried along from sample to sample. */
  ref: Record<string, V>;
  /**
   * Baking takes two passes. Pass 1 solves every sample on its own and smooths the result: no jumps, but the
   * smoothed path may cut through a body where the raw answers used to flip. Pass 2 solves every sample again,
   * this time starting from the smoothed path, so each answer is both free of bodies and close to its neighbours.
   */
  first: Track | null;
}

const ENV = { skin: "#000000", hair: "#000000", time: 0 };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V, fallback: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return l > 1e-6 ? [a[0] / l, a[1] / l, a[2] / l] : fallback;
};
/** The part of `a` that is square to `axis`, as a unit vector. */
const squareTo = (a: V, axis: V, fallback: V) => {
  const d = dot(a, axis);
  return unit([a[0] - axis[0] * d, a[1] - axis[1] * d, a[2] - axis[2] * d], fallback);
};
/** Turn `a` around `axis` by `angle`. `a` must be square to `axis`. */
const turn = (a: V, axis: V, angle: number) => {
  const b = cross(axis, a),
    c = Math.cos(angle),
    s = Math.sin(angle);
  return [a[0] * c + b[0] * s, a[1] * c + b[1] * s, a[2] * c + b[2] * s];
};
/** The angle equal to x (same direction) that is closest to ref. */
const near = (x: number, ref: number) => x - Math.round((x - ref) / TAU) * TAU;

/** Start baking the loaded move. Call `step` until it reports done. */
export function startBake(rate = 24): BakeJob {
  const loop = !noLoop(),
    n = counts() * rate + (loop ? 0 : 1);
  return { track: { rate, loop, n, ch: {} }, next: 0, done: false, ref: {}, first: null };
}

/** Bake for at most `budgetMs` milliseconds. Returns true when the track is finished and smoothed. */
export function step(job: BakeJob, budgetMs = Infinity): boolean {
  if (job.done) return true;
  const { track } = job,
    saved = time(),
    t0 = Date.now();
  const put = (name: string, p: V) => (track.ch[name] ??= []).push(p.slice());
  const first = job.first;
  // joined hands share one path: the leader's
  setHandPrior(
    first
      ? (w, sd, partner, t) => sample(first, w === "f" && partner ? `l hand ${partner}` : `${w} hand ${sd}`, t)
      : null,
  );
  while (job.next < track.n) {
    const now = Math.min(job.next / track.rate, counts() - (track.loop ? 1e-6 : 0));
    setTime(now);
    const { Pl, Pf } = couple(),
      shapes: Shape[] = [];
    if (first)
      for (const [who, P] of [
        ["l", Pl],
        ["f", Pf],
      ] as const)
        (P as any).elbowPrior = { L: elbowDirAt(first, who, "L", now), R: elbowDirAt(first, who, "R", now) };
    body(Pl, "#000000", shapes, true, ENV);
    body(Pf, "#000000", shapes, false, ENV);
    for (const [who, P] of [
      ["l", Pl],
      ["f", Pf],
    ] as const) {
      put(`${who} hips`, [P.c[0], 0, P.c[1]]);
      put(`${who} look`, [P.headTh - P.th, 0, 0]); // head turn relative to the body
      for (const sd of SIDES) {
        put(`${who} hand ${sd}`, P.hands[sd]);
        put(`${who} foot ${sd}`, P[sd]);
        // The elbow sits on a circle around the shoulder-wrist line. Its place on that circle is stored as an angle from a
        // reference direction. The reference is carried from sample to sample with the smallest possible turn, so it never flips.
        const { dir, axis } = (P as any).elbowOut[sd],
          key = `${who} ${sd}`;
        const ref = (job.ref[key] = squareTo(job.ref[key] ?? dir, axis, dir));
        put(`${who} axis ${sd}`, axis);
        put(`${who} ref ${sd}`, ref);
        put(`${who} swivel ${sd}`, [Math.atan2(dot(dir, cross(axis, ref)), dot(dir, ref)), 0, 0]);
      }
    }
    job.next++;
    if (Date.now() - t0 > budgetMs) break;
  }
  setTime(saved);
  setHandPrior(null);
  if (job.next < track.n) return false;
  if (!first) {
    finish(track, 1);
    job.first = track;
    job.track = { rate: track.rate, loop: track.loop, n: track.n, ch: {} };
    job.next = 0;
    job.ref = {};
    return step(job, budgetMs - (Date.now() - t0));
  }
  finish(track, 0.6); // the second pass only needs a light touch
  // feet, hips and head are not re-solved in pass 2: keep their fully smoothed paths from pass 1
  for (const name in first.ch)
    if (["foot", "hips", "look"].includes(name.split(" ")[1])) track.ch[name] = first.ch[name];
  job.done = true;
  return true;
}
/** 0..1 */
export const progress = (job: BakeJob) =>
  job.done ? 1 : (job.next + (job.first ? job.track.n : 0)) / (2 * job.track.n);

function finish(track: Track, strength: number) {
  const { ch, n } = track;
  for (const who of ["l", "f"])
    for (const sd of SIDES) {
      const ref = ch[`${who} ref ${sd}`],
        axis = ch[`${who} axis ${sd}`],
        sw = ch[`${who} swivel ${sd}`];
      // angles: no step larger than half a turn
      for (let i = 1; i < n; i++) sw[i][0] = near(sw[i][0], sw[i - 1][0]);
      if (track.loop) {
        // After one loop the carried reference has drifted by some angle from where it began. Spread that drift
        // evenly over the loop so that the last sample joins the first one.
        const carried = squareTo(ref[n - 1], axis[0], ref[0]);
        const drift = Math.atan2(dot(carried, cross(axis[0], ref[0])), dot(carried, ref[0]));
        for (let i = 0; i < n; i++) {
          const a = (drift * i) / n;
          ref[i] = turn(ref[i], axis[i], -a);
          sw[i][0] += a;
        }
      }
    }
  for (const name in ch) {
    const kind = name.split(" ")[1],
      sigma = BLUR[kind] * track.rate * strength;
    if (sigma > 0) ch[name] = blur(ch[name], sigma, track.loop, ANGLE.has(kind));
  }
}

/** Bake the loaded move in one go. */
export function bakeNow(rate = 24): Track {
  const job = startBake(rate);
  step(job);
  return job.track;
}

/** Gaussian blur along time. For a looping move the ends wrap around; otherwise they hold. */
function blur(pts: V[], sigma: number, loop: boolean, angle: boolean): V[] {
  const n = pts.length,
    R = Math.max(1, Math.ceil(sigma * 3)),
    w: number[] = [];
  for (let k = -R; k <= R; k++) w.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
  const sum = w.reduce((a, b) => a + b, 0);
  return pts.map((_, i) => {
    const o = [0, 0, 0];
    for (let k = -R; k <= R; k++) {
      const j = loop ? (((i + k) % n) + n) % n : Math.min(n - 1, Math.max(0, i + k)),
        q = pts[j],
        f = w[k + R] / sum;
      o[0] += (angle ? near(q[0], pts[i][0]) : q[0]) * f;
      o[1] += q[1] * f;
      o[2] += q[2] * f;
    }
    return o;
  });
}

/** A channel's value at time t (in counts): a smooth curve through the samples. */
export function sample(track: Track, name: string, t: number): V {
  const a = track.ch[name],
    n = track.n,
    u = t * track.rate,
    i = Math.floor(u),
    s = u - i;
  const at = (k: number) => a[track.loop ? ((k % n) + n) % n : Math.min(n - 1, Math.max(0, k))];
  let p0 = at(i - 1),
    p1 = at(i),
    p2 = at(i + 1),
    p3 = at(i + 2);
  if (ANGLE.has(name.split(" ")[1])) [p0, p2, p3] = [p0, p2, p3].map((p) => [near(p[0], p1[0]), 0, 0]); // stay on the same turn across the loop seam
  const s2 = s * s,
    s3 = s2 * s;
  // Catmull-Rom
  return [0, 1, 2].map(
    (d) =>
      0.5 *
      (2 * p1[d] +
        (p2[d] - p0[d]) * s +
        (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * s2 +
        (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * s3),
  );
}

/** Which way the elbow points from the shoulder-wrist line at time t. */
function elbowDirAt(track: Track, who: string, sd: string, t: number): V {
  const axis = unit(sample(track, `${who} axis ${sd}`, t), [0, -1, 0]);
  const ref = squareTo(sample(track, `${who} ref ${sd}`, t), axis, [1, 0, 0]);
  return turn(ref, axis, sample(track, `${who} swivel ${sd}`, t)[0]);
}
/** Replace the instant-by-instant answers in both poses with the baked, smoothed ones. */
export function applyTrack(track: Track, Pl: any, Pf: any, t: number) {
  for (const [who, P] of [
    ["l", Pl],
    ["f", Pf],
  ] as const) {
    const hips = sample(track, `${who} hips`, t);
    P.c = [hips[0], hips[2]];
    P.headTh = P.th + sample(track, `${who} look`, t)[0];
    P.elbowDir = {};
    for (const sd of SIDES) {
      P.hands[sd] = sample(track, `${who} hand ${sd}`, t);
      P[sd] = sample(track, `${who} foot ${sd}`, t);
      if (P[sd][1] < 0) P[sd][1] = 0;
      P.elbowDir[sd] = elbowDirAt(track, who, sd, t);
    }
  }
  // each dancer's view of the other must follow the smoothed hips too
  Pl.oc = Pf.c;
  Pl.occ = Pf.c;
  Pf.oc = Pl.c;
  Pf.occ = Pl.c;
}
