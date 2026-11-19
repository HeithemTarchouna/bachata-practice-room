// Where a named hand position is in space.
import { vec } from "./core";
export function shoulder(st, side) {
  const v = vec(st.th),
    s = side === "R" ? 0.18 : -0.18;
  return [st.c[0] + v.r[0] * s, 1.38, st.c[1] + v.r[1] * s];
}
export function restHand(st, side) {
  const v = vec(st.th),
    k = side === "R" ? 0.24 : -0.24;
  return [st.c[0] + v.f[0] * 0.16 + v.r[0] * k, 0.98, st.c[1] + v.f[1] * 0.16 + v.r[1] * k];
}

// hand positions that sit on one dancer's body ('f' = hers, 'l' = his). Everything else is a point in the room.
export const ANCHOR = {
  earL: "f",
  earR: "f",
  sideBackL: "f",
  sideBackR: "f",
  frontHigh: "f",
  back: "f",
  backHigh: "f",
  sideR: "f",
  side: "f",
  leftHigh: "f",
  chest: "f",
  face: "f",
  wrapFront: "f",
  hipR: "f",
  frontL: "f",
  crown: "f",
  besideL: "f",
  shoulderL: "f",
  bladeL: "f",
  ownShR: "f",
  frontRt: "f",
  frontUp: "f",
  backR: "f",
  hipBackR: "f",
  hipBackRHigh: "f",
  frontC: "f",
  backC: "f",
  frontL2: "f",
  leadShL: "l",
  leadNape: "l",
};
export function connPos(st, lh, fh, ty) {
  const fv = vec(st.f.th),
    lv = vec(st.l.th),
    fc = st.f.c,
    lc = st.l.c;
  const dx = lc[0] - fc[0],
    dz = lc[1] - fc[1],
    dl = Math.hypot(dx, dz) || 1,
    tl = [dx / dl, dz / dl];
  const at = (o, y) => [o[0], y, o[1]],
    off = (base, a, b, ka, kb) => [base[0] + a[0] * ka + b[0] * kb, base[1] + a[1] * ka + b[1] * kb];
  switch (ty) {
    case "mid":
    case "prep": {
      const a = shoulder(st.l, lh),
        b = shoulder(st.f, fh);
      return [(a[0] + b[0]) / 2, ty === "prep" ? 1.28 : 1.04, (a[2] + b[2]) / 2];
    }
    case "earL":
      return at(off(fc, fv.r, fv.f, -0.14, 0.2), 1.5);
    case "earR":
      return at(off(fc, fv.r, fv.f, 0.14, 0.2), 1.5);
    case "low": {
      const a = shoulder(st.l, lh),
        b = shoulder(st.f, fh);
      return [(a[0] + b[0]) / 2, 0.92, (a[2] + b[2]) / 2];
    }
    case "sideBackL":
      return at(off(fc, fv.r, fv.f, -0.16, -0.05), 1.06);
    case "halo":
      return at(off(fc, tl, fv.f, 0.14, 0.05), 1.9);
    case "haloOut":
      return at(off(fc, tl, fv.f, 0.24, 0), 1.97);
    case "frontHigh":
      return at(off(fc, fv.f, fv.r, 0.34, 0), 1.38);
    case "haloFwd":
      return at(off(fc, tl, fv.f, 0.2, 0.2), 2.08);
    case "haloLead":
      return at(off(off(lc, tl, lv.f, -0.14, 0.05), lv.r, lv.f, -0.09, 0), 1.92); // above his own head, a little to the side of the arm that holds it
    case "haloFar":
      return at(off(fc, tl, fv.f, 0.42, 0), 1.45);
    case "haloBig":
      return at(off(fc, tl, fv.f, 0.14, 0.34), 1.82);
    case "back":
      return at(off(fc, fv.f, fv.r, -0.11, -0.1), 1.07); // the small of her back, on her left: the side his arm comes round
    case "backHigh":
      return at(off(fc, fv.f, fv.r, -0.16, -0.08), 1.32);
    case "sideR":
      return at(off(fc, fv.r, fv.f, 0.22, 0), 1.05);
    case "side":
      return at(off(fc, fv.r, fv.f, -0.16, 0.05), 1.05);
    case "sideRHigh":
      return at(off(fc, fv.r, tl, 0.34, 0.08), 1.3);
    case "frontUp":
      return at(off(fc, fv.f, fv.r, 0.26, -0.06), 1.97); // in front of her at forehead height, a forearm away
    case "leftHigh":
      return at(off(fc, fv.r, fv.f, -0.4, 0.15), 1.92);
    case "chest":
      return at(off(fc, fv.f, fv.r, 0.26, -0.04), 1.3);
    case "face":
      return at(off(fc, fv.f, fv.r, 0.4, -0.1), 1.55);
    case "wrapFront":
      return at(off(fc, fv.f, fv.r, 0.2, -0.1), 1.06);
    case "frontRt":
      return at(off(fc, fv.f, fv.r, 0.2, 0.1), 1.02); // in front of her, a little to her right, clear of her skirt
    case "frontC":
      return at(off(fc, fv.f, fv.r, 0.23, -0.02), 1.02); // straight in front of her
    case "frontL2":
      return at(off(fc, fv.r, fv.f, -0.13, 0.17), 1.02); // in front of her left hip
    case "backC":
      return at(off(fc, fv.f, fv.r, -0.125, 0), 1.07); // the middle of her back, at the waist
    case "backR":
      return at(off(fc, fv.r, fv.f, 0.07, -0.12), 1.07); // her back, a little to her right
    case "hipBackR":
      return at(off(fc, fv.r, fv.f, 0.12, -0.09), 1.06); // her right hip, from behind: where her left hand rests in the hammerlock
    case "hipBackRHigh":
      return at(off(fc, fv.r, fv.f, 0.1, -0.12), 1.32);
    case "hipR":
      return at(off(fc, fv.r, fv.f, 0.16, -0.01), 1.06); // her right hip: in the wrap this is the far side, so his arm lies behind her back
    // course combination: holds and contact points
    case "high": {
      const a = shoulder(st.l, lh),
        b = shoulder(st.f, fh);
      return [a[0] * 0.4 + b[0] * 0.6, 1.72, a[2] * 0.4 + b[2] * 0.6];
    }
    case "waistNear":
      return at(off(lc, tl, lv.f, -0.15, 0), 1.0); // his waist, on the side nearest to her
    case "sideBackR":
      return at(off(fc, fv.r, fv.f, 0.15, -0.08), 1.06); // her right hip, slightly behind
    case "frontL":
      return at(off(fc, fv.f, fv.r, 0.2, -0.12), 1.15); // in front of her, a little to her left
    case "crown":
      return at(off(fc, fv.f, fv.r, 0.1, 0), 1.92); // just above and in front of her head
    case "besideL":
      return at(off(fc, fv.r, fv.f, -0.2, 0.03), 1.58); // beside her head, on her left // behind her neck
    case "shoulderL":
      return at(off(fc, fv.r, fv.f, -0.175, 0.07), 1.37); // front of her left shoulder
    case "bladeL":
      return at(off(fc, fv.r, fv.f, -0.175, 0.02), 1.24); // her left side, under her arm: where his hand can actually reach in a closed hold // her left shoulder blade
    case "ownShR":
      return at(off(fc, fv.r, fv.f, 0.1, 0.15), 1.3); // her own hand held in front of her right shoulder
    case "leadShL":
      return at(off(lc, lv.r, lv.f, -0.17, 0.05), 1.4); // on his left shoulder
    case "leadNape":
      return at(off(lc, lv.r, lv.f, 0.18, -0.05), 1.46); // behind his neck, toward his right shoulder
    case "closed":
      return at(off([(lc[0] + fc[0]) / 2, (lc[1] + fc[1]) / 2], lv.r, lv.f, -0.2, 0), 1.25); // closed hold: joined hands at chest height on his left
  }
}
