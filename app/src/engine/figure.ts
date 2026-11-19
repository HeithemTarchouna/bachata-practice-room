import type { Shape, BodyEnv } from "./shapes";
// Builds a dancer's body for one moment: a list of simple shapes (capsules, balls, panels) in meters.
import { vec, lerp, lerp3, clamp, ik, tint } from "./core";
import { DIMS, LEG, PROFS, bodyGap } from "./bodyshape";
export function body(P: any, col: string, items: Shape[], isLead: boolean, env: BodyEnv) {
  const id = isLead ? "l" : "f",
    D = DIMS[id],
    v = P.v,
    lf = [-v.r[0], -v.r[1]],
    hy = P.stiff ? 0.958 : 0.9 + P.bob,
    tilt = P.wgt * P.amp;
  const shW = D.shW,
    hipW = D.hipW;
  const hL = [P.c[0] + lf[0] * hipW, hy + tilt, P.c[1] + lf[1] * hipW],
    hR = [P.c[0] - lf[0] * hipW, hy - tilt, P.c[1] - lf[1] * hipW];
  const fm = [(P.L[0] + P.R[0]) / 2, (P.L[2] + P.R[2]) / 2],
    ubk = 0.3 + 0.55 * (P.ub || 0),
    sc = [fm[0] + (P.c[0] - fm[0]) * ubk, fm[1] + (P.c[1] - fm[1]) * ubk];
  const cy = P.stiff ? 1.43 : 1.38 + P.bob * 0.6,
    lean = P.headPitch ? 0.05 : 0;
  const chest = [sc[0] + v.f[0] * lean, cy, sc[1] + v.f[1] * lean];
  const sL = [chest[0] + lf[0] * shW, cy - tilt * 0.4, chest[2] + lf[1] * shW],
    sR = [chest[0] - lf[0] * shW, cy + tilt * 0.4, chest[2] - lf[1] * shW];
  const pel = [P.c[0], hy, P.c[1]],
    wy = (hy + cy) / 2 + 0.03;
  const waist = [(pel[0] + chest[0]) / 2 + v.f[0] * 0.02, wy, (pel[2] + chest[2]) / 2 + v.f[1] * 0.02];
  const hv = vec(P.headTh),
    HR = D.head,
    head = [chest[0] + hv.f[0] * (0.02 + lean), cy + 0.222 - lean * 0.6, chest[2] + hv.f[1] * (0.02 + lean)];
  const skin = env.skin,
    hair = env.hair,
    pants = isLead ? tint(col, 0.45) : skin,
    shoe = "#221C26",
    fwd = [v.f[0], 0, v.f[1]];
  const cap = (a, b, wa, wb, c, side, ex: any = {}) =>
    items.push({ t: "c", a, b, wa, wb, col: c, side, id, lead: isLead, ...ex });
  const dot = (p, r, c, ex: any = {}) => items.push({ t: "o", p, r, col: c, side: "C", id, lead: isLead, ...ex });
  const poly = (pts, c, ex: any = {}) => items.push({ t: "p", pts, col: c, side: "C", id, lead: isLead, ...ex });
  const TG = { torso: 1, tg: 1 };
  // --- legs
  for (const [hp, ft, sd] of [
    [hL, P.L, "L"],
    [hR, P.R, "R"],
  ]) {
    const k = ik(hp, ft, LEG, fwd),
      ank = [ft[0], ft[1] + 0.06, ft[2]];
    cap(hp, k, D.thigh[0], D.thigh[1], pants, sd, { part: "thigh" });
    cap(k, ank, D.shin[0], D.shin[1], pants, sd, { part: "shin" });
    const fv = P.fth ? vec(P.fth[sd]).f : v.f,
      at = (a, y) => [ft[0] + fv[0] * a, ft[1] + y, ft[2] + fv[1] * a];
    if (isLead) {
      cap(at(-0.065, 0.04), at(0.16, 0.032), 0.04, 0.034, shoe, sd);
      cap(at(-0.07, 0.012), at(0.17, 0.012), 0.012, 0.012, tint(shoe, 0.6), sd, { flat: 1 });
    } // shoe and sole
    else {
      cap(at(-0.035, 0.055), at(0.13, 0.02), 0.027, 0.021, skin, sd);
      cap(at(0.04, 0.022), at(0.145, 0.016), 0.026, 0.02, shoe, sd); // foot, then the toe of the shoe
      cap(at(-0.045, 0.06), at(-0.035, 0.035), 0.022, 0.02, shoe, sd, { flat: 1 });
      cap(at(-0.045, 0.05), at(-0.05, 0.004), 0.009, 0.006, shoe, sd, { flat: 1 });
    } // heel cup and heel
  }
  // --- torso: horizontal bars stacked from hips to shoulders, plus a spine capsule. They share one gradient, so they read as a single body.
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const bar = (u, k, r, c, fw = 0) => {
    const A = mix(hL, sL, u),
      B = mix(hR, sR, u),
      m = mix(A, B, 0.5),
      f = fw || 0;
    const a = [m[0] + (A[0] - m[0]) * k + v.f[0] * f, A[1], m[2] + (A[2] - m[2]) * k + v.f[1] * f],
      b = [m[0] + (B[0] - m[0]) * k + v.f[0] * f, B[1], m[2] + (B[2] - m[2]) * k + v.f[1] * f];
    cap(a, b, r, r, c, "C", { ...TG, bar: 1 });
    return [a, b];
  };
  // profile: [height 0..1 from hips to shoulders, half width, depth radius, how far forward]
  const PROF = PROFS[id];
  const prof = (u) => {
    let i = 0;
    while (i < PROF.length - 2 && PROF[i + 1][0] < u) i++;
    const A = PROF[i],
      B = PROF[i + 1],
      k = clamp((u - A[0]) / (B[0] - A[0]), 0, 1);
    return [lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k)];
  };
  const lineHalf = (u) => hipW + (shW - hipW) * u,
    edgeL = [],
    edgeR = [],
    rings = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14,
      [h, r, fw] = prof(u),
      c = isLead ? col : u > 0.87 ? skin : col,
      e = bar(u, h / lineHalf(u), r, c, fw);
    rings.push({ a: e[0], b: e[1], r, col: c });
    edgeL.push(e[0]);
    edgeR.unshift(e[1]);
  }
  poly([...edgeL, ...edgeR], col, TG); // flat fill, used by the 2D fallback only
  items.push({ t: "loft", id, lead: isLead, side: "C", col, rings, fwd: [v.f[0], 0, v.f[1]], torso: 1 }); // the torso as one smooth surface
  if (isLead) {
    cap(pel, chest, D.torso[0], D.torso[1], col, "C", { ...TG, part: "torso" });
    cap([chest[0], cy + 0.01, chest[2]], [chest[0], cy + 0.08, chest[2]], 0.075, 0.05, col, "C", TG); // collar
  } else {
    cap(waist, chest, D.torso[0], D.torso[1], col, "C", { ...TG, part: "torso" });
    // skirt: fitted from the waist over the hips, then flaring to the hem
    const fl = 0.18 + Math.min(0.045, Math.abs(P.av) / 1500),
      wyS = mix(hL, sL, 0.4)[1],
      n = 18,
      sw = clamp(P.av / 700, -0.13, 0.13);
    items.push({
      t: "x",
      a: [pel[0], hy, pel[2]],
      b: [pel[0], 0.6, pel[2]],
      ra: 0.15,
      rb: fl * 0.85,
      part: "skirt",
      id,
    });
    const ring = (r, y, ox, oz, wv) =>
      [...Array(n + 1).keys()].map((i) => {
        const a = (i / n) * 6.283;
        return [
          pel[0] + ox + Math.cos(a) * r,
          y + (wv ? 0.014 * Math.sin(3 * a + env.time * 3) : 0),
          pel[2] + oz + Math.sin(a) * r,
        ];
      });
    const r0 = ring(0.112, wyS, (waist[0] - pel[0]) * 0.5, (waist[2] - pel[2]) * 0.5, 0),
      r1 = ring(0.172, hy - 0.02, 0, 0, 0),
      r2 = ring(fl, 0.56, lf[0] * sw, lf[1] * sw, 1),
      ctr = [pel[0], 0.78, pel[2]];
    for (let i = 0; i < n; i++) {
      const c = tint(col, (0.93 + 0.15 * Math.cos(((i + 0.5) / n) * 6.283 + 2.3)) * (i % 2 ? 0.97 : 1));
      poly([r0[i], r0[i + 1], r1[i + 1], r1[i]], c, { skirt: 1, ctr, base: col });
      poly([r1[i], r1[i + 1], r2[i + 1], r2[i]], c, { skirt: 1, ctr, base: col });
    }
  }
  // --- neck and head
  const nb = [head[0], head[1] - HR * 0.75, head[2]];
  cap(chest, nb, D.neck * 0.7, D.neck * 0.7, skin, "C", { torso: 1, part: "neck" });
  cap([chest[0], cy + 0.02, chest[2]], nb, D.neck * 1.45, D.neck * 1.05, skin, "C", { torso: 1, ne: 1 }); // wider where it meets the shoulders
  // --- arms
  for (const sd of ["L", "R"]) {
    const s = sd === "L" ? sL : sR,
      o = sd === "L" ? 1 : -1;
    let h = P.hands[sd];
    if (P.joined[sd]) h = [h[0], h[1] + (isLead ? -0.014 : 0.014), h[2]]; // his palm underneath, her hand resting on top
    // A hand that rests ON the partner lies flat on them: the wrist is lifted off the body and bends, like a real wrist.
    const cw = P.oc && P.ancW ? P.ancW[sd] : 0,
      onP = cw > 0.001;
    let out = [0, 0, 0],
      hT = h; // cw: how much this hand is resting on the partner right now (0 to 1)
    if (onP) {
      const ox = h[0] - P.oc[0],
        oz = h[2] - P.oc[1],
        ol = Math.hypot(ox, oz) || 1;
      out = [ox / ol, 0, oz / ol];
      const d0 = [h[0] - s[0], h[1] - s[1], h[2] - s[2]],
        dl = Math.hypot(...d0) || 1;
      hT = [
        h[0] + (out[0] * 0.045 - (d0[0] / dl) * 0.04) * cw,
        h[1] - (d0[1] / dl) * 0.04 * cw,
        h[2] + (out[2] * 0.045 - (d0[2] / dl) * 0.04) * cw,
      ];
    }
    const rs = clamp((hT[1] - 1.3) / 0.5, 0, 1),
      eo = (isLead ? 0.6 : 0.3) + rs * 1.2,
      fEnd = lerp(0.72, 0.97, cw);
    // Where does the elbow go? Shoulder and wrist are fixed, so the elbow can sit anywhere on a circle around the line between them.
    // Every position on that circle is scored: stay near the natural hang of the arm, and keep both bones out of the partner's
    // body, out of your own head and in front of your own chest. The result is a smooth blend of the good positions.
    const nat = [
        lf[0] * o * eo - v.f[0] * 0.25 * (1 - rs),
        -(1 - rs) + rs * 0.3,
        lf[1] * o * eo - v.f[1] * 0.25 * (1 - rs),
      ],
      BL = 0.33;
    const ax = [hT[0] - s[0], hT[1] - s[1], hT[2] - s[2]],
      al = Math.hypot(...ax) || 1e-6,
      au = ax.map((x) => x / al),
      half = Math.min(al / 2, BL * 0.999),
      rc = Math.sqrt(Math.max(0, BL * BL - half * half));
    const md = [s[0] + au[0] * half, s[1] + au[1] * half, s[2] + au[2] * half],
      nd = nat[0] * au[0] + nat[1] * au[1] + nat[2] * au[2];
    let u1 = [nat[0] - au[0] * nd, nat[1] - au[1] * nd, nat[2] - au[2] * nd];
    {
      const l = Math.hypot(...u1);
      u1 = l > 1e-6 ? u1.map((x) => x / l) : [lf[0] * o, 0, lf[1] * o];
    }
    // Second baking pass: prefer where the elbow was on the time-smoothed path over the plain natural hang.
    const prior = P.elbowPrior && P.elbowPrior[sd];
    if (prior) {
      const pd = prior[0] * au[0] + prior[1] * au[1] + prior[2] * au[2],
        w = [prior[0] - au[0] * pd, prior[1] - au[1] * pd, prior[2] - au[2] * pd],
        l = Math.hypot(...w);
      if (l > 1e-6) u1 = w.map((x) => x / l);
    }
    const u2 = [au[1] * u1[2] - au[2] * u1[1], au[2] * u1[0] - au[0] * u1[2], au[0] * u1[1] - au[1] * u1[0]];
    // the partner's body is an oval column: wide across the shoulders, shallow front to back, narrower at her waist
    const need = HR + 0.05,
      oB = P.oc ? { c: P.occ || P.oc, ch: P.och, th: P.oth == null ? 0 : P.oth } : null,
      oW = isLead ? "f" : "l",
      oHead = oB
        ? (() => {
            const q = vec(oB.th),
              cc = oB.ch || oB.c;
            return [cc[0] + q.f[0] * 0.02, 1.6, cc[1] + q.f[1] * 0.02];
          })()
        : null,
      oHR = DIMS[oW].head + 0.05;
    const inside = (q) => {
      if (!oB) return null;
      if (q[1] > 1.42) {
        const dx = q[0] - oHead[0],
          dy = q[1] - oHead[1],
          dz = q[2] - oHead[2],
          d = Math.hypot(dx, dy, dz);
        if (d < oHR) {
          const dh = Math.hypot(dx, dz) || 1e-6;
          return [oHR - d, dx / dh, dz / dh];
        }
      } // the partner's head
      return bodyGap(q, oB, oW, 0.042);
    }; // the partner's body, as it is drawn
    const cost = (e) => {
      let pen = 0;
      for (const [a, b, end] of [
        [s, e, 1],
        [e, hT, fEnd],
      ])
        for (let k = 1; k <= 6; k++) {
          const u = (k / 6) * end,
            q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
          const ins = inside(q);
          if (ins) pen += ins[0] * ins[0];
          const dh = Math.hypot(q[0] - head[0], q[1] - head[1], q[2] - head[2]);
          if (dh < need) pen += (need - dh) * (need - dh) * 2;
        }
      const fd = (e[0] - P.c[0]) * v.f[0] + (e[2] - P.c[1]) * v.f[1],
        sdw = Math.abs((e[0] - P.c[0]) * lf[0] + (e[2] - P.c[1]) * lf[1]);
      if (fd < 0.05 && sdw < shW + 0.02 && e[1] < cy + 0.05) pen += (0.05 - fd) * (0.05 - fd) * 3; // the elbow doesn't go through your own back
      return pen;
    };
    let acc = [0, 0, 0],
      wsum = 0;
    // A baked move already knows where the elbow goes (see bake.ts): then it only has to be put back on the circle.
    const fixE = P.elbowDir && P.elbowDir[sd];
    const NA = fixE ? 0 : 28;
    for (let i = 0; i < NA; i++) {
      const ph = (i / NA) * 6.283,
        cs = Math.cos(ph),
        sn = Math.sin(ph),
        dir = [u1[0] * cs + u2[0] * sn, u1[1] * cs + u2[1] * sn, u1[2] * cs + u2[2] * sn];
      const sc =
          (prior ? 0.3 : 0.16) * (1 - cs) + 420 * cost([md[0] + dir[0] * rc, md[1] + dir[1] * rc, md[2] + dir[2] * rc]),
        w = Math.exp(-sc / 0.035);
      acc[0] += dir[0] * w;
      acc[1] += dir[1] * w;
      acc[2] += dir[2] * w;
      wsum += w;
    }
    if (fixE) {
      const wd = fixE[0] * au[0] + fixE[1] * au[1] + fixE[2] * au[2];
      acc = [fixE[0] - au[0] * wd, fixE[1] - au[1] * wd, fixE[2] - au[2] * wd];
    }
    {
      const l = Math.hypot(...acc);
      acc = l > 1e-9 ? acc.map((x) => x / l) : u1;
    }
    let e = [md[0] + acc[0] * rc, md[1] + acc[1] * rc, md[2] + acc[2] * rc];
    // last resort, when no elbow position is free: let the arm give a little and push the elbow clear
    for (let it = 0; it < (fixE ? 0 : 6); it++) {
      let moved = false;
      for (const [a, b, end] of [
        [s, e, 1],
        [e, hT, fEnd],
      ]) {
        const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
          l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1e-9;
        const u = clamp(((head[0] - a[0]) * ab[0] + (head[1] - a[1]) * ab[1] + (head[2] - a[2]) * ab[2]) / l2, 0, 1),
          cp = [a[0] + ab[0] * u, a[1] + ab[1] * u, a[2] + ab[2] * u];
        const dv = [cp[0] - head[0], cp[1] - head[1], cp[2] - head[2]],
          d = Math.hypot(...dv);
        if (d < need) {
          const k = ((need - d) * 1.6) / (d || 1e-6);
          let dd = d > 1e-4 ? dv : [lf[0] * o, 0, lf[1] * o];
          if (d <= 1e-4) dd = dd.map((x) => x * 0.01);
          e = [e[0] + dd[0] * k, e[1] + dd[1] * k, e[2] + dd[2] * k];
          moved = true;
        }
        for (let k = 1; k <= 6; k++) {
          const uu = (k / 6) * end,
            ins = inside([a[0] + (b[0] - a[0]) * uu, a[1] + (b[1] - a[1]) * uu, a[2] + (b[2] - a[2]) * uu]);
          if (ins) {
            e = [e[0] + ins[1] * ins[0] * 1.3, e[1], e[2] + ins[2] * ins[0] * 1.3];
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    // bones don't stretch: at most 2 cm of give on each, however hard the elbow was pushed
    for (let it = 0; it < 3; it++) {
      const ds = Math.hypot(e[0] - s[0], e[1] - s[1], e[2] - s[2]);
      if (ds > BL + 0.02) {
        const k = (BL + 0.02) / ds;
        e = [s[0] + (e[0] - s[0]) * k, s[1] + (e[1] - s[1]) * k, s[2] + (e[2] - s[2]) * k];
      }
      const dh = Math.hypot(e[0] - hT[0], e[1] - hT[1], e[2] - hT[2]);
      if (dh > BL + 0.02) {
        const k = (BL + 0.02) / dh;
        e = [hT[0] + (e[0] - hT[0]) * k, hT[1] + (e[1] - hT[1]) * k, hT[2] + (e[2] - hT[2]) * k];
      }
    }
    // report which way the elbow points from the shoulder-wrist line, and that line: baking smooths these over time
    {
      const w = [e[0] - md[0], e[1] - md[1], e[2] - md[2]],
        wl = Math.hypot(...w) || 1;
      (P.elbowOut ??= {})[sd] = { dir: w.map((x) => x / wl), axis: au };
    }
    const ac = isLead ? col : skin;
    dot(s, D.upper[0] * 1.0, ac, { torso: 1, ne: 1, tg: 1 }); // the round of the shoulder, shaded with the torso so it doesn't read as a ball joint
    dot(e, D.upper[1] * 1.02, ac, { torso: 1, side: sd, ne: 1 }); // elbow
    const hd = [hT[0] - e[0], hT[1] - e[1], hT[2] - e[2]],
      hl = Math.hypot(...hd) || 1,
      du = hd.map((x) => x / hl);
    // free hand: wrist 6 cm before the palm, fingers straight on. Resting hand: wrist lifted off the body, fingers following the surface.
    const wr = [hT[0] - du[0] * 0.06 * (1 - cw), hT[1] - du[1] * 0.06 * (1 - cw), hT[2] - du[2] * 0.06 * (1 - cw)];
    let tip = [h[0] + du[0] * 0.045, h[1] + du[1] * 0.045, h[2] + du[2] * 0.045];
    if (onP) {
      let f = [h[0] - wr[0], h[1] - wr[1], h[2] - wr[2]];
      const fo = f[0] * out[0] + f[2] * out[2];
      f = [f[0] - out[0] * fo, f[1], f[2] - out[2] * fo];
      const fl = Math.hypot(...f) || 1;
      tip = lerp3(
        tip,
        [
          h[0] + (f[0] / fl) * 0.05 + out[0] * 0.022,
          h[1] + (f[1] / fl) * 0.05,
          h[2] + (f[2] / fl) * 0.05 + out[2] * 0.022,
        ],
        cw,
      );
    }
    // the hand point is where the PALM is. The wrist sits before it, so two joined hands meet instead of passing through each other.
    cap(s, e, D.upper[0], D.upper[1], ac, sd, { part: "upper" });
    cap(e, wr, D.fore[0], D.fore[1], skin, sd, { part: "fore" });
    items.push({ t: "o", p: h, r: D.hand, col: skin, side: sd, id, lead: isLead, hand: 1, nod: 1 });
    cap(wr, h, D.fore[1] * 1.02, D.hand * 0.9, skin, sd, { ne: 1, part: "hnd", onP });
    cap(h, tip, D.hand * 0.9, D.hand * 0.58, skin, sd, { part: "hnd", onP });
  } // palm, then fingers
  // --- head: one shape (skull and jaw), drawn with a face by drawHead()
  const fp = (f, s, y) => [
    head[0] + hv.f[0] * HR * f + hv.r[0] * HR * s,
    head[1] + HR * y,
    head[2] + hv.f[1] * HR * f + hv.r[1] * HR * s,
  ];
  items.push({
    t: "h",
    p: head,
    r: HR,
    col: skin,
    id,
    lead: isLead,
    side: "C",
    yaw: P.headTh,
    face: { fp, HR, hair, skin, isLead },
  });
  if (isLead) dot(fp(-0.24, 0, 0.3), HR * 1.0, hair, { torso: 1 });
  else {
    dot(fp(-0.27, 0, 0.25), HR * 1.05, hair, { torso: 1 });
    // long hair down her back, one soft shape that swings out when she turns
    const sw = clamp(-P.av / 600, -0.17, 0.17),
      base = fp(-0.62, 0, -0.05);
    const tip = [
      base[0] - hv.f[0] * (0.035 + Math.abs(sw) * 0.3) + lf[0] * sw,
      base[1] - 0.25 + Math.abs(sw) * 0.15,
      base[2] - hv.f[1] * (0.035 + Math.abs(sw) * 0.3) + lf[1] * sw,
    ];
    cap(base, tip, 0.082, 0.05, hair, "C", { torso: 1, ne: 1 });
  }
  return { id, sL, sR, hL, hR };
}
