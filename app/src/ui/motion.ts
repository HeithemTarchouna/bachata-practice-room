// Real-motion mode: plays back the two dancers traced from one of your own videos (a .poses.json file made
// by extract_poses.py) as flat figures, with tap-tempo counts, looping and mirroring.
import { cleanMotion, tint } from "./motion-clean";
import { tf, tr } from "../i18n";

type Ctx = CanvasRenderingContext2D;

export class RealMotion {
  data: any = null;
  /** Position in the clip, seconds. */
  t = 0;
  duration = 0;
  rate = 0.5;
  mirror = false;
  swapColors = false;
  bpm = 0;
  /** Clip time of a count 1. */
  offset = 0;
  loopFrom: number | null = null;
  loopTo: number | null = null;
  private taps: number[] = [];
  private lastBeat = -1;

  get active() {
    return !!this.data;
  }

  /** Throws if the object is not a motion file. */
  load(obj: any) {
    if (
      !obj ||
      !Array.isArray(obj.frames) ||
      !obj.frames.length ||
      !obj.width ||
      !obj.height ||
      !obj.frames.every((f: any) => Array.isArray(f.p))
    )
      throw new Error("not a motion file");
    this.data = cleanMotion(obj);
    this.duration = this.data.frames[this.data.frames.length - 1].t;
    this.t = 0;
    this.bpm = 0;
    this.offset = 0;
    this.taps = [];
    this.loopFrom = this.loopTo = null;
    this.lastBeat = -1;
  }
  close() {
    this.data = null;
  }

  /** Advance playback. Returns the count (1..8) when a new beat starts, else 0. */
  advance(dt: number): number {
    this.t += dt * this.rate;
    if (this.t >= (this.loopTo ?? this.duration)) this.t = this.loopFrom ?? 0;
    if (!this.bpm) return 0;
    const beat = Math.floor(((this.t - this.offset) * this.bpm) / 60 + 1e-6);
    if (beat === this.lastBeat) return 0;
    this.lastBeat = beat;
    return (((beat % 8) + 8) % 8) + 1;
  }
  stepFrames(n: number) {
    this.t = Math.min(this.duration, Math.max(0, this.t + n / this.data.fps));
  }
  /** Current count 1..8, or 0 when no beat has been set. */
  count() {
    return this.bpm ? (((Math.floor(((this.t - this.offset) * this.bpm) / 60 + 1e-6) % 8) + 8) % 8) + 1 : 0;
  }
  /** Tap along with the steps. Returns a status line. */
  tap(): string {
    if (this.taps.length && Math.abs(this.t - this.taps[this.taps.length - 1]) > 3) this.taps = [];
    this.taps.push(this.t);
    if (this.taps.length > 9) this.taps.shift();
    if (this.taps.length < 3) return tf("Keep tapping: {n}…", { n: this.taps.length });
    const gap = (this.taps[this.taps.length - 1] - this.taps[0]) / (this.taps.length - 1);
    if (gap <= 0.05) return tr("Keep tapping…");
    this.bpm = 60 / gap;
    if (!this.offset) this.offset = this.taps[0];
    return tf("{n} BPM. Now pause on a 1 and mark it.", { n: Math.round(this.bpm) });
  }
  markOne(): string {
    if (!this.bpm) return tr("Tap the beat first (at least 3 taps).");
    this.offset = this.t;
    this.lastBeat = -1;
    return `${Math.round(this.bpm)} BPM, count 1 set.`;
  }

  /** The two dancers' joints at the current time, interpolated between video frames. */
  private joints(): (number[][] | null)[] {
    const fr = this.data.frames;
    let i = Math.min(fr.length - 1, Math.max(0, Math.floor(this.t * this.data.fps)));
    while (i > 0 && fr[i].t > this.t) i--;
    while (i < fr.length - 1 && fr[i + 1].t <= this.t) i++;
    const a = fr[i],
      b = fr[Math.min(i + 1, fr.length - 1)],
      u = b.t > a.t ? Math.min(1, Math.max(0, (this.t - a.t) / (b.t - a.t))) : 0;
    return [0, 1].map((k) => {
      const pa = a.p[k],
        pb = b.p[k];
      if (!pa) return null;
      if (!pb) return pa;
      return pa.map((q: number[], j: number) => [
        q[0] + (pb[j][0] - q[0]) * u,
        q[1] + (pb[j][1] - q[1]) * u,
        Math.min(q[2], pb[j][2]),
      ]);
    });
  }

  draw(ctx: Ctx, W: number, H: number, zoom: number, colors: { lead: string; follow: string; floor: string }) {
    const vw = this.data.view,
      vW = vw.x1 - vw.x0,
      vH = vw.y1 - vw.y0,
      sc = Math.min(W / vW, H / vH) * zoom,
      ox = (W - vW * sc) / 2,
      oy = (H - vH * sc) / 2;
    const X = (x: number) => ox + ((this.mirror ? vw.x1 - (x - vw.x0) : x) - vw.x0) * sc,
      Y = (y: number) => oy + (y - vw.y0) * sc;
    const line = (p: number[], q: number[]) => {
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
    };
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const fy = Y(this.data.floorY) + 6;
    ctx.strokeStyle = colors.floor;
    ctx.lineWidth = 2;
    line([W * 0.06, fy], [W * 0.94, fy]);
    const lowest = (kp: number[][]) => Math.max(...kp.filter((q) => q[2] > 0.3).map((q) => q[1]));
    const people = this.joints()
      .map((kp, k) => ({ kp, k }))
      .filter((o) => o.kp)
      .sort((a, b) => lowest(a.kp!) - lowest(b.kp!));
    for (const { kp, k } of people as { kp: number[][]; k: number }[]) {
      const col = (k === 0) !== this.swapColors ? colors.lead : colors.follow,
        dk = tint(col, 0.72);
      const ok = (j: number) => kp[j] && kp[j][2] > 0.3,
        P = (j: number) => [X(kp[j][0]), Y(kp[j][1])];
      const torso =
        ok(5) && ok(11)
          ? Math.hypot(kp[5][0] - kp[11][0], kp[5][1] - kp[11][1])
          : ok(6) && ok(12)
            ? Math.hypot(kp[6][0] - kp[12][0], kp[6][1] - kp[12][1])
            : vH * 0.2;
      const u = torso * sc,
        lw = Math.max(4, u * 0.13);
      const limb = (a: number, b: number, c: string, w: number) => {
        if (ok(a) && ok(b)) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          line(P(a), P(b));
        }
      };
      limb(11, 13, dk, lw * 1.1);
      limb(13, 15, dk, lw * 0.95);
      limb(12, 14, dk, lw * 1.1);
      limb(14, 16, dk, lw * 0.95);
      for (const j of [15, 16])
        if (ok(j)) {
          const q = P(j);
          ctx.fillStyle = dk;
          ctx.beginPath();
          ctx.ellipse(q[0], q[1] + lw * 0.3, lw * 1.1, lw * 0.55, 0, 0, 6.283);
          ctx.fill();
        }
      if (ok(5) && ok(6) && ok(11) && ok(12)) {
        ctx.fillStyle = col;
        ctx.strokeStyle = col;
        ctx.lineWidth = lw * 1.2;
        ctx.beginPath();
        [5, 6, 12, 11].forEach((j, i) => {
          const q = P(j);
          i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        limb(5, 11, col, lw * 1.6);
        limb(6, 12, col, lw * 1.6);
        limb(5, 6, col, lw);
        limb(11, 12, col, lw);
      }
      limb(5, 7, col, lw * 0.9);
      limb(7, 9, col, lw * 0.8);
      limb(6, 8, col, lw * 0.9);
      limb(8, 10, col, lw * 0.8);
      ctx.fillStyle = col;
      for (const j of [9, 10])
        if (ok(j)) {
          const q = P(j);
          ctx.beginPath();
          ctx.arc(q[0], q[1], lw * 0.6, 0, 6.283);
          ctx.fill();
        }
      const ears = ok(3) && ok(4) ? [(P(3)[0] + P(4)[0]) / 2, (P(3)[1] + P(4)[1]) / 2] : null;
      const head = ears ?? (ok(0) ? P(0) : ok(3) ? P(3) : ok(4) ? P(4) : null);
      if (head) {
        const r = u * 0.21;
        if (ok(5) && ok(6)) {
          const a = P(5),
            b = P(6);
          ctx.strokeStyle = col;
          ctx.lineWidth = lw * 0.8;
          line([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], head);
        }
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(head[0], head[1] - r * 0.1, r, 0, 6.283);
        ctx.fill();
      }
    }
  }
}
