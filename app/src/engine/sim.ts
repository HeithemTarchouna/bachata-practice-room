// Turns a move (one key per count) into continuous motion: feet, hips, facing and hand targets at any time t.
import { R, vec, FW, wrapDeg, lerp, lerp3, ease, clamp, mono } from "./core";
import { FS, DIMS, bodyGap } from "./bodyshape";
import { ANCHOR, connPos, restHand } from "./hands";
import { moves } from "../moves/library";
let NL = false,
  bad = false,
  FL: any = {},
  mi = 0,
  t = 0,
  keys: any[] = [],
  N = 8;
function prepare() {
  const m = moves[mi],
    mk = bad && m.mistake ? m.mistake : null;
  FL = (mk && mk.flags) || {};
  N = m.keys.length;
  NL = !!m.start; // a move with a starting position does not loop: it jumps back to the start
  const mk1 = (key, i) => {
    let l = { ...key.l },
      f = { ...key.f };
    const S = FL.far ? 1.1 : 0.78;
    l.x *= S;
    l.z *= S;
    f.x *= S;
    f.z *= S;
    const sw = { ...((mk && mk.swap) || {}), ...((mk && mk.swapAt && mk.swapAt[i + 1]) || {}) };
    return { l, f, h: key.h.map(([a, b, ty]) => [a, b, sw[ty] || ty]), cue: key.cue, ax: key.ax };
  };
  const src = m.keys.map(mk1);
  const raw = [NL ? mk1(m.start, -1) : src[N - 1], ...src];
  let ax = 90;
  const out = [],
    axes = {};
  for (const k of NL ? [...Array(N + 1).keys()] : [...Array(N).keys()].map((i) => i + 1).concat([0])) {
    const L = raw[k].l;
    if (L.mode === "basic") ax = L.th;
    if (raw[k].ax != null) ax = raw[k].ax;
    axes[k] = ax;
  }
  for (let k = 0; k <= N; k++) {
    const key = raw[k],
      tc = k === 0 ? ((N - 1) % 8) + 1 : ((k - 1) % 8) + 1;
    let l = { ...key.l },
      f = { ...key.f };
    if (k === 0 && !NL) {
      l.th = raw[1].l.th + wrapDeg(l.th - raw[1].l.th);
      f.th = raw[1].f.th + wrapDeg(f.th - raw[1].f.th);
    }
    out.push({ l: dancer(l, tc, axes[k], true), f: dancer(f, tc, axes[k], false) });
  }
  const sideV = (th, sd) => {
    const q = vec(th),
      s = sd === "L" ? FS : -FS;
    return [-q.r[0] * s, -q.r[1] * s];
  };
  for (const w of ["l", "f"])
    for (let k = 0; k <= N; k++) {
      const d = out[k][w];
      d.fL = d.fR = d.th;
    }
  for (const pass of [0, 1])
    for (const w of ["l", "f"]) {
      if (pass && !NL && (out[N][w].pv || out[N][w].adj)) {
        const a = out[0][w],
          z = out[N][w];
        a.adj = z.adj;
        a.L = z.L;
        a.R = z.R;
        a.c = z.c;
        a.fL = z.fL + (a.th - z.th);
        a.fR = z.fR + (a.th - z.th);
      }
      for (let k = 1; k <= N; k++) {
        const cur = out[k][w],
          prev = out[k - 1][w];
        if (!cur.turn) {
          // coming out of a turn into the basic: no foot may slide. The standing foot stays where it is,
          // and each foot only reaches its basic position on its own next step.
          if (prev.pv || prev.adj) {
            const sup = prev.wL ? "L" : "R",
              fr = sup === "L" ? "R" : "L",
              ps = prev[sup];
            if (cur.wL === prev.wL) {
              if (prev.pv && prev.trav && Math.hypot(cur[sup][0] - ps[0], cur[sup][2] - ps[2]) > 0.12) continue;
              const a = sideV(cur.th, fr),
                b = sideV(cur.th, sup);
              cur[sup] = [ps[0], 0, ps[2]];
              cur[fr] = [ps[0] + a[0] - b[0], cur[fr][1], ps[2] + a[1] - b[1]];
              cur.adj = 1;
            } else if (Math.hypot(cur[sup][0] - ps[0], cur[sup][2] - ps[2]) > 0.01) {
              cur[sup] = [ps[0], 0, ps[2]];
              cur.adj = 1;
            }
            if (cur.adj) {
              const wf = cur.wL ? cur.L : cur.R,
                of = cur.wL ? cur.R : cur.L;
              cur.c = [wf[0] * 0.75 + of[0] * 0.25, wf[2] * 0.75 + of[2] * 0.25];
            }
          }
          continue;
        }
        if (cur.pv) {
          // pivot turn: the body turns over the standing foot, the free foot steps in beside it
          const sup = prev.wL ? "L" : "R",
            ps = prev[sup],
            so = sideV(cur.th, sup),
            tol = cur.trav ? 0.06 : 0.09;
          let cx = ps[0] - so[0],
            cz = ps[2] - so[1];
          const ex = cur.b[0] - cx,
            ez = cur.b[1] - cz,
            el = Math.hypot(ex, ez);
          const nw = cur.wL ? "L" : "R",
            fr = sup === "L" ? "R" : "L",
            sf = sideV(cur.th, fr);
          if (cur.trav && nw !== sup) {
            // walking step while turning: the stepping foot lands AHEAD of the body, the body ends up
            // between the two feet. Strides are capped so no leg has to stretch.
            const nb = out[k < N ? k + 1 : 1][w].b;
            let lx = (nb[0] - cur.b[0]) * 0.5,
              lz = (nb[1] - cur.b[1]) * 0.5;
            const ll = Math.hypot(lx, lz);
            if (ll > 0.17) {
              lx *= 0.17 / ll;
              lz *= 0.17 / ll;
            }
            let sx = cur.b[0] + lx - cx,
              sz = cur.b[1] + lz - cz;
            const s0 = sideV(prev.th, fr),
              nx = s0[0] / FS,
              nz = s0[1] / FS,
              dn = sx * nx + sz * nz;
            if (!cur.cross && dn < -0.07) {
              sx -= nx * (dn + 0.07);
              sz -= nz * (dn + 0.07);
            }
            if (cur.cross) {
              const fq = vec(cur.th).f;
              sx += fq[0] * 0.11;
              sz += fq[1] * 0.11;
            } // a crossing foot lands in front of the other one
            const sl = Math.hypot(sx, sz),
              cap = cur.cross ? 0.3 : 0.36;
            if (sl > cap) {
              sx *= cap / sl;
              sz *= cap / sl;
            }
            cur[sup] = [ps[0], 0, ps[2]];
            cur[fr] = [cx + sx + sf[0], 0, cz + sz + sf[1]];
            const nxk = out[Math.min(k + 1, N)][w];
            cur["f" + fr] = cur.th + clamp((nxk.th - cur.th) * 0.4, -50, 50);
            cur["f" + sup] = clamp(prev["f" + sup], cur.th - 50, cur.th + 50);
            cur.c = [cx + sx * 0.5, cz + sz * 0.5];
            continue;
          }
          if (el > tol) {
            let dx = ex * (1 - tol / el),
              dz = ez * (1 - tol / el);
            // the stepping foot may travel, but never sideways across the standing foot
            // it may land in line with the standing foot (as in a travelling turn) but only clearly in front of or behind it
            const nx = sf[0] / FS,
              nz = sf[1] / FS,
              fq = vec(cur.th).f;
            let lat = dx * nx + dz * nz + FS * 2;
            if (lat < 0.08) {
              dx += nx * (0.08 - lat);
              dz += nz * (0.08 - lat);
              lat = 0.08;
            } // never straight behind the other foot: knees need room
            const fw = dx * fq[0] + dz * fq[1];
            if (nw !== sup && lat < 0.11 && Math.abs(fw) < 0.17) {
              const g = (fw >= 0 ? 0.17 : -0.17) - fw;
              dx += fq[0] * g;
              dz += fq[1] * g;
            }
            cx += dx;
            cz += dz;
          }
          cur[sup] = [ps[0], 0, ps[2]];
          cur[fr] = [cx + sf[0], nw === sup ? cur[fr][1] : 0, cz + sf[1]];
          // where each foot points: the landing foot is already turned toward where the turn is going,
          // the standing foot keeps its direction and only pivots when the hips force it to
          const nxk = out[Math.min(k + 1, N)][w],
            lead = nw === sup ? 0 : clamp((nxk.th - cur.th) * 0.4, -50, 50);
          cur["f" + fr] = cur.th + lead;
          cur["f" + sup] = clamp(prev["f" + sup], cur.th - 50, cur.th + 50);
          cur.c = [cx, cz];
          continue;
        }
        {
          const su = prev.wL ? "L" : "R",
            fe = su === "L" ? "R" : "L",
            nk = out[Math.min(k + 1, N)][w],
            stp = cur.wL !== prev.wL;
          cur["f" + su] = clamp(prev["f" + su], cur.th - 50, cur.th + 50);
          cur["f" + fe] = cur.th + (stp ? clamp((nk.th - cur.th) * 0.4, -50, 50) : 0);
        }
        if (cur.wL === prev.wL) continue;
        const pl = cur.wL ? "R" : "L",
          sp = cur.wL ? "L" : "R",
          nx = out[Math.min(k + 1, N)][w],
          v = vec(cur.th + clamp(nx.th - cur.th, -170, 170) / 2),
          sg = sp === "L" ? FS : -FS;
        cur[pl] = [prev[pl][0], 0, prev[pl][2]];
        cur[sp] = [cur.b[0] - v.r[0] * sg, 0, cur.b[1] - v.r[1] * sg];
        cur.c = [cur[sp][0] * 0.6 + cur[pl][0] * 0.4, cur[sp][2] * 0.6 + cur[pl][2] * 0.4];
      }
    }
  for (let k = 0; k <= N; k++) {
    const st = out[k],
      conn = { l: {}, f: {} };
    const anc = { l: {}, f: {} };
    st.l.JP = {};
    st.f.JP = {};
    for (const [lh, fh, ty] of raw[k].h) {
      const p = connPos(st, lh, fh, ty),
        an = ANCHOR[ty] || null;
      if (lh) {
        conn.l[lh] = p;
        anc.l[lh] = an;
      }
      if (fh) {
        conn.f[fh] = p;
        anc.f[fh] = an;
      }
      if (lh && fh) {
        st.l.JP[lh] = fh;
        st.f.JP[fh] = lh;
      }
    } // a hand can also rest on the partner: then only one of the two is named
    for (const w of ["l", "f"]) {
      st[w].H = {};
      st[w].J = {};
      st[w].A = {};
      st[w].HL = {};
      for (const sd of ["L", "R"]) {
        st[w].J[sd] = !!conn[w][sd];
        const p = (st[w].H[sd] = conn[w][sd] || restHand(st[w], sd));
        // a hand that rests on a body is remembered relative to that body, so it stays on it while the body turns between counts
        const an = (st[w].A[sd] = conn[w][sd] ? anc[w][sd] : w);
        if (an) {
          const B = st[an],
            q = vec(B.th),
            dx = p[0] - B.c[0],
            dz = p[2] - B.c[1];
          st[w].HL[sd] = [dx * q.r[0] + dz * q.r[1], dx * q.f[0] + dz * q.f[1], p[1]];
        }
      }
    }
  }
  keys = out;
}
function dancer(d, tc, axTh, isLead) {
  const v = vec(d.th),
    a = vec(axTh),
    axis = [-a.r[0], -a.r[1]],
    left = [-v.r[0], -v.r[1]],
    sc = FL.big ? 1.9 : 1;
  const [P0, M0, w, lift] = FW[tc],
    P = P0 * sc,
    M = M0 * sc;
  let pP,
    mP,
    LisP = true,
    bx = d.x,
    bz = d.z;
  if (d.mode === "basic" && d.fw === "fwd") {
    const fa = a.f;
    pP = [d.x + fa[0] * P + axis[0] * FS, d.z + fa[1] * P + axis[1] * FS];
    mP = [d.x + fa[0] * M - axis[0] * FS, d.z + fa[1] * M - axis[1] * FS];
    LisP = !!isLead;
  } else if (d.mode === "basic") {
    const k = d.fw === "place" ? 0.22 : 1,
      o = d.fw === "place" ? FS : 0;
    pP = [d.x + axis[0] * (P * k + o), d.z + axis[1] * (P * k + o)];
    mP = [d.x + axis[0] * (M * k - o), d.z + axis[1] * (M * k - o)];
    LisP = left[0] * axis[0] + left[1] * axis[1] >= 0;
  } else {
    const dr = d.drift ? [0, -0.125, 0, 0.125, 0.25, 0.125, 0, -0.125, -0.25][tc] : 0;
    bx = d.x + axis[0] * dr;
    bz = d.z + axis[1] * dr;
    pP = [bx + left[0] * FS, bz + left[1] * FS];
    mP = [bx - left[0] * FS, bz - left[1] * FS];
    if (d.mir || !isLead) {
      LisP = false;
      [pP, mP] = [mP, pP];
    }
  }
  const Lf = LisP ? pP : mP,
    Rf = LisP ? mP : pP,
    flip = !isLead && d.mode === "basic" && d.fw === "place" && LisP;
  let wL = (w === "P") === LisP;
  let liftL = lift ? (lift === "P") === LisP : false,
    liftR = lift ? !liftL : false;
  if (flip) {
    wL = !wL;
    [liftL, liftR] = [liftR, liftL];
  } // she keeps her own footwork when she stands beside him
  const wf = wL ? Lf : Rf,
    of = wL ? Rf : Lf,
    mix = d.mode === "turn" ? 0.55 : 0.75;
  return {
    b: [bx, bz],
    th: d.th,
    c: [wf[0] * mix + of[0] * (1 - mix), wf[1] * mix + of[1] * (1 - mix)],
    L: [Lf[0], liftL ? 0.03 : 0, Lf[1]],
    R: [Rf[0], liftR ? 0.03 : 0, Rf[1]],
    wL,
    tap: tc % 4 === 0,
    turn: d.mode === "turn",
    pv: d.mode === "turn",
    trav: !d.drift,
    soft: !!d.soft,
    cross: !!d.cross,
  };
}
function get(i, w) {
  if (NL) return keys[clamp(i, 0, N)][w];
  let k = i,
    o = 0;
  const dTh = keys[N][w].th - keys[0][w].th;
  if (i < 0) {
    k = N + i;
    o = -dTh;
  } else if (i > N) {
    k = i - N;
    o = dTh;
  }
  const s = keys[k][w];
  return o ? { ...s, th: s.th + o, fL: s.fL + o, fR: s.fR + o } : s;
}
// where a dancer's body is right now, and which way it faces
function cthAt(w) {
  const a = NL ? Math.min(Math.floor(t), N - 1) : Math.floor(t) % N,
    s = NL ? Math.min(t - a, 1) : t - Math.floor(t);
  const P0 = get(a - 1, w),
    P1 = get(a, w),
    P2 = get(a + 1, w),
    P3 = get(a + 2, w),
    M = (fn) => mono(fn(P0), fn(P1), fn(P2), fn(P3), s),
    th = M((p) => p.th);
  let c = [M((p) => p.c[0]), M((p) => p.c[1])];
  if (P2.pv && !P2.trav) {
    const sup = P1.wL ? "L" : "R",
      kk = sup === "L" ? FS : -FS,
      cp = (a) => {
        const q = vec(a);
        return [P1[sup][0] + q.r[0] * kk, P1[sup][2] + q.r[1] * kk];
      };
    const e = ease(s),
      a0 = cp(P1.th),
      a1 = cp(P2.th),
      ct = cp(th);
    c = [
      ct[0] + (P1.c[0] - a0[0]) * (1 - e) + (P2.c[0] - a1[0]) * e,
      ct[1] + (P1.c[1] - a0[1]) * (1 - e) + (P2.c[1] - a1[1]) * e,
    ];
  }
  return { th, c };
}
// Everything about where a dancer's body is right now: facing, hips, both feet, and the centre of the chest.
function kin(w) {
  const a = NL ? Math.min(Math.floor(t), N - 1) : Math.floor(t) % N,
    s = NL ? Math.min(t - a, 1) : t - Math.floor(t);
  const P1 = get(a, w),
    P2 = get(a + 1, w),
    { th, c } = cthAt(w),
    v = vec(th),
    sm = s * s * (3 - 2 * s),
    lf = [-v.r[0], -v.r[1]];
  const stepSide = P1.wL !== P2.wL ? (P2.wL ? "L" : "R") : null;
  const foot = (sd) => {
    const A = P1[sd],
      Bf = P2[sd],
      moved = Math.hypot(A[0] - Bf[0], A[2] - Bf[2]) > 0.03;
    const bq = lerp3(A, Bf, ease(s));
    if (moved) bq[1] += 0.05 * Math.sin(Math.PI * s);
    if (!(moved && P2.pv)) return bq;
    // a real step: the foot stays on the floor at first, then lifts, travels and lands on the count
    const k = sd === "L" ? FS : -FS,
      u = clamp((s - 0.2) / 0.8, 0, 1),
      wg = 1 - Math.pow(1 - u, 3);
    const e = P2.trav ? ease(u) : wg,
      tx = P2.trav ? Bf[0] : c[0] + lf[0] * k,
      tz = P2.trav ? Bf[2] : c[1] + lf[1] * k;
    let px = lerp(A[0], tx, e),
      pz = lerp(A[2], tz, e);
    // don't kick your own ankle: if the straight path passes close to the standing foot, swing the foot around it
    {
      const S = P1[sd === "L" ? "R" : "L"],
        dx = Bf[0] - A[0],
        dz = Bf[2] - A[2],
        l2 = dx * dx + dz * dz,
        q = clamp(((S[0] - A[0]) * dx + (S[2] - A[2]) * dz) / l2, 0, 1);
      let nx = A[0] + dx * q - S[0],
        nz = A[2] + dz * q - S[2];
      const d = Math.hypot(nx, nz),
        need = 0.24;
      if (d < need && q > 0.08 && q < 0.92) {
        if (d < 0.01) {
          const fl = Math.sqrt(l2),
            sgn = (A[0] - S[0]) * v.f[0] + (A[2] - S[2]) * v.f[1] >= 0 ? 1 : -1;
          nx = -dz / fl;
          nz = dx / fl;
          if ((nx * v.f[0] + nz * v.f[1]) * sgn < 0) {
            nx = -nx;
            nz = -nz;
          }
        } else {
          nx /= d;
          nz /= d;
        }
        const bow = (need - d) * Math.sin(Math.PI * e);
        px += nx * bow;
        pz += nz * bow;
      }
    }
    return [px, lerp(A[1], Bf[1], u) + (P2.trav ? 0.07 : 0.08) * Math.sin(Math.PI * u), pz];
  };
  const L = foot("L"),
    R = foot("R"),
    fm = [(L[0] + R[0]) / 2, (L[2] + R[2]) / 2],
    ubk = 0.3 + 0.55 * lerp(P1.pv ? 1 : 0, P2.pv ? 1 : 0, sm);
  return { th, c, L, R, ch: [fm[0] + (c[0] - fm[0]) * ubk, fm[1] + (c[1] - fm[1]) * ubk] };
}
function pose(w, oc) {
  const a = NL ? Math.min(Math.floor(t), N - 1) : Math.floor(t) % N,
    s = NL ? Math.min(t - a, 1) : t - Math.floor(t);
  const P0 = get(a - 1, w),
    P1 = get(a, w),
    P2 = get(a + 1, w),
    P3 = get(a + 2, w);
  const M = (fn) => mono(fn(P0), fn(P1), fn(P2), fn(P3), s);
  const KN = kin(w),
    { th, c } = KN,
    v = vec(th),
    sm = s * s * (3 - 2 * s),
    lf = [-v.r[0], -v.r[1]],
    other = kin(w === "l" ? "f" : "l");
  const hands = {},
    joined = {};
  // A hand that is on a body at either end of this count travels WITH that body (it is interpolated in the body's own frame),
  // so it goes around a turning partner instead of cutting through them. The partner's body wins over your own.
  const ow0 = w === "l" ? "f" : "l",
    OK = [get(a - 1, ow0), get(a, ow0), get(a + 1, ow0), get(a + 2, ow0)],
    SK = [P0, P1, P2, P3],
    ancW = {};
  for (const sd of ["L", "R"]) {
    joined[sd] = (s < 0.5 ? P1 : P2).J[sd];
    const x = P1.A[sd],
      y = P2.A[sd],
      an = x === y ? x : x && x !== w ? x : y && y !== w ? y : x || y;
    ancW[sd] = (x && x !== w ? 1 - sm : 0) + (y && y !== w ? sm : 0);
    if (an) {
      const KS = an === w ? SK : OK,
        B = an === w ? { th, c } : other,
        q = vec(B.th);
      const loc = (k) => {
        const Bk = KS[k],
          p = SK[k].H[sd],
          qk = vec(Bk.th),
          dx = p[0] - Bk.c[0],
          dz = p[2] - Bk.c[1];
        return [dx * qk.r[0] + dz * qk.r[1], dx * qk.f[0] + dz * qk.f[1], p[1]];
      };
      // ...and it goes AROUND that body: angle and distance from the body's axis are interpolated, not a straight line through it
      const L = [loc(0), loc(1), loc(2), loc(3)],
        ang = L.map((p) => Math.atan2(p[0], p[1])),
        rad = L.map((p) => Math.hypot(p[0], p[1])),
        wr = (d) => Math.atan2(Math.sin(d), Math.cos(d));
      ang[2] = ang[1] + wr(ang[2] - ang[1]);
      ang[0] = ang[1] + wr(ang[0] - ang[1]);
      ang[3] = ang[2] + wr(ang[3] - ang[2]);
      const A = mono(ang[0], ang[1], ang[2], ang[3], s),
        Rr = mono(rad[0], rad[1], rad[2], rad[3], s),
        ly = mono(L[0][2], L[1][2], L[2][2], L[3][2], s),
        l = [Math.sin(A) * Rr, Math.cos(A) * Rr];
      hands[sd] = [B.c[0] + q.r[0] * l[0] + q.f[0] * l[1], ly, B.c[1] + q.r[1] * l[0] + q.f[1] * l[1]];
    } else hands[sd] = [0, 1, 2].map((i) => M((p) => p.H[sd][i]));
  }
  const amp = (p) => (FL.stiff && w === "l" ? 0 : (p.tap ? 0.05 : 0.035) * (p.turn ? 0.45 : 1));
  let headTh = th;
  const turning = P1.turn || P2.turn,
    noSpot = FL.noSpot && w === "l";
  if (turning && !noSpot && oc) {
    const toO = Math.atan2(oc[0] - c[0], oc[1] - c[1]) / R;
    headTh = th + clamp(wrapDeg(toO - th), -95, 95);
  }
  const stiff = FL.stiff && w === "l",
    sN = Math.min(1, s + 0.03),
    sP = Math.max(0, s - 0.03),
    av = (mono(P0.th, P1.th, P2.th, P3.th, sN) - mono(P0.th, P1.th, P2.th, P3.th, sP)) / (sN - sP);
  const fhead = (sd) => {
    if (!P1.turn && !P2.turn) return th;
    const F1 = P1["f" + sd],
      F2 = P2["f" + sd],
      supp = sd === (P1.wL ? "L" : "R");
    const h = supp
      ? clamp(F1, th - 50, th + 50)
      : clamp(lerp(F1, F2, ease(clamp((s - 0.2) / 0.8, 0, 1))), th - 70, th + 70);
    return P2.turn ? h : lerp(h, th, sm);
  };
  // REACH: an arm is 66 cm of bone plus the hand. No hand may be asked to go further than that from its own shoulder, and joined
  // hands must be somewhere BOTH dancers can reach. Out-of-reach targets are pulled in (leader's reach first, then hers, repeated).
  {
    const shAt = (B, ww, sd) => {
        const q = vec(B.th),
          k = DIMS[ww].shW * (sd === "L" ? -1 : 1);
        return [B.ch[0] + q.r[0] * k, 1.38, B.ch[1] + q.r[1] * k];
      },
      me = KN,
      RCH = 0.68;
    const pull = (T, S) => {
      const d = [T[0] - S[0], T[1] - S[1], T[2] - S[2]],
        l = Math.hypot(...d);
      return l > RCH ? [S[0] + (d[0] * RCH) / l, S[1] + (d[1] * RCH) / l, S[2] + (d[2] * RCH) / l] : T;
    };
    // ...and a hand is never INSIDE a body. If the only reachable spot is inside someone, the hand slides round to the nearest
    // point on their surface instead (this wins over reach).
    const outOf = (T, B, lead) => {
      const g = bodyGap(T, B, lead ? "l" : "f", 0.046);
      return g ? [T[0] + g[1] * g[0], T[1], T[2] + g[2] * g[0]] : T;
    };
    const lB = w === "l" ? me : other,
      fB = w === "f" ? me : other;
    for (const sd of ["L", "R"]) {
      const ps = (s < 0.5 ? P1 : P2).JP[sd],
        mine = shAt(me, w, sd);
      // Second baking pass: start from the time-smoothed path instead of the raw target, so the answer stays close to it.
      const prior = handPrior ? handPrior(w, sd, ps, t) : null;
      let T = prior ?? hands[sd];
      // if the spot on the surface is still out of reach, walk it round the body toward the shoulder that can't reach it
      const round = (T, B, S) => {
        if (prior) return T; // walking round is a jump; the smoothed path has already chosen its side
        const d = Math.hypot(T[0] - S[0], T[1] - S[1], T[2] - S[2]);
        if (d <= RCH + 0.004) return T;
        const dx = T[0] - B.c[0],
          dz = T[2] - B.c[1],
          r = Math.hypot(dx, dz);
        if (r > 0.3) return T;
        const aT = Math.atan2(dz, dx),
          aS = Math.atan2(S[2] - B.c[1], S[0] - B.c[0]),
          df = Math.atan2(Math.sin(aS - aT), Math.cos(aS - aT)),
          st = clamp(df, -0.3, 0.3),
          a = aT + st;
        return [B.c[0] + Math.cos(a) * r, T[1], B.c[1] + Math.sin(a) * r];
      };
      if (ps) {
        const his = w === "l" ? mine : shAt(other, "l", ps),
          hers = w === "f" ? mine : shAt(other, "f", ps);
        for (let i = 0; i < 8; i++) {
          T = pull(T, his);
          T = pull(T, hers);
          T = outOf(T, fB, false);
          T = outOf(T, lB, true);
          T = round(T, fB, his);
          T = round(T, lB, hers);
          T = outOf(T, fB, false);
          T = outOf(T, lB, true);
        }
      } else {
        const oB = w === "l" ? fB : lB;
        for (let i = 0; i < 6; i++) {
          T = pull(T, mine);
          T = outOf(T, fB, false);
          T = outOf(T, lB, true);
          T = round(T, oB, mine);
          T = outOf(T, fB, false);
          T = outOf(T, lB, true);
        }
      }
      hands[sd] = T;
    }
  }
  return {
    ancW,
    oth: other.th,
    och: other.ch,
    ch: KN.ch,
    occ: other.c,
    fth: { L: fhead("L"), R: fhead("R") },
    ub: lerp(P1.pv ? 1 : 0, P2.pv ? 1 : 0, sm),
    oc,
    av,
    th,
    v,
    c,
    L: KN.L,
    R: KN.R,
    hands,
    joined,
    wL: s < 0.5 ? P1.wL : P2.wL,
    headTh,
    headPitch: FL.lookDown && w === "l" ? 0.65 : 0,
    stiff,
    wgt: lerp(P1.wL ? 1 : -1, P2.wL ? 1 : -1, sm),
    amp: lerp(amp(P1), amp(P2), sm),
    bob: stiff ? 0 : -0.03 * Math.sin(Math.PI * s),
  };
}
export { prepare, pose, kin, get };

// ---- public interface of the simulation
/** Load a move. `mistake` selects its "common mistake" version when it has one. */
export function load(index: number, mistake = false) {
  mi = index;
  bad = mistake && !!moves[index].mistake;
  prepare();
}
/** Used by baking: where a hand was on the time-smoothed path. (who, side, partner's side if joined, time) */
let handPrior: ((w: string, sd: string, partnerSide: string | undefined, t: number) => number[] | null) | null = null;
export function setHandPrior(fn: typeof handPrior) {
  handPrior = fn;
}
export function setTime(x: number) {
  t = x;
}
export const time = () => t;
export const counts = () => N;
/** True for a move that starts from a set position and does not loop. */
export const noLoop = () => NL;
export const flags = () => FL;
export const keyStates = () => keys;
export const moveIndex = () => mi;
export const isMistake = () => bad;
/** Pose of one dancer at another time, without disturbing the current time. */
export function poseAt(tt: number, w: "l" | "f", oc: number[] | null) {
  const k = t;
  t = NL ? clamp(tt, 0, N) : ((tt % N) + N) % N;
  const p = pose(w, oc);
  t = k;
  return p;
}
/** Both dancers right now. Each needs to know where the other one stands. */
export function couple() {
  const f0 = pose("f", null),
    Pl = pose("l", f0.c),
    Pf = pose("f", Pl.c);
  return { Pl, Pf };
}
