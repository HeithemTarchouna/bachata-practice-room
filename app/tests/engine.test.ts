// Structure and bookkeeping: the things that must hold for the choreography data and the engine's maths.
import { describe, expect, it } from "vitest";
import { moves, load, setTime, frame, counts, noLoop } from "../src/engine";
import { segmentDistance } from "../src/checks";
import { mono, wrapDeg } from "../src/engine/core";
import { SEG, chainKeys } from "../src/moves/library";

describe("choreography data", () => {
  it.each(moves.map((m) => [m.name, m] as const))("%s is complete", (_name, m) => {
    expect(m.keys.length % 8).toBe(0);
    expect(m.about.length).toBeGreaterThan(20);
    expect(m.tips.length).toBeGreaterThan(0);
    expect(m.errors.length).toBeGreaterThan(0);
    for (const k of m.keys) {
      expect(k.cue.length, "every count needs a cue").toBeGreaterThan(3);
      expect(Number.isFinite(k.l.x + k.l.z + k.l.th + k.f.x + k.f.z + k.f.th)).toBe(true);
      for (const [lh, fh] of k.h) expect(lh || fh, "a hand link must name at least one hand").toBeTruthy();
    }
  });

  it("move names are unique", () => {
    expect(new Set(moves.map((m) => m.name)).size).toBe(moves.length);
  });

  it("course sections chain: each one starts where the one before ended", () => {
    const order = [SEG.basic, SEG.cbl, SEG.lturn, SEG.hturn, SEG.back, SEG.loopturn, SEG.hisloop, SEG.closed];
    const keys = chainKeys(order);
    expect(keys.length).toBe(64);
    for (let s = 1; s < order.length; s++) {
      const end = keys[s * 8 - 1].l,
        first = keys[s * 8].l;
      // the leader never jumps more than one step between the last count of a section and the first of the next
      expect(Math.hypot(end.x - first.x, end.z - first.z)).toBeLessThan(0.45);
    }
  });
});

describe("engine", () => {
  it("a looping move ends exactly where it began", () => {
    for (const name of ["Side basic", "Inside turn", "Wrap", "Place swap"]) {
      const i = moves.findIndex((m) => m.name === name);
      load(i);
      expect(noLoop()).toBe(false);
      setTime(0);
      const a = frame();
      setTime(counts() - 1e-6);
      const b = frame();
      for (const P of ["Pl", "Pf"] as const) {
        expect(Math.hypot(a[P].c[0] - b[P].c[0], a[P].c[1] - b[P].c[1])).toBeLessThan(0.02);
        expect(Math.abs(wrapDeg(a[P].th - b[P].th))).toBeLessThan(2);
      }
    }
  });

  it("joined hands are in the same place for both dancers", () => {
    load(moves.findIndex((m) => m.name === "Side basic"));
    for (const t of [0, 1.3, 2.7, 5.5]) {
      setTime(t);
      const { Pl, Pf } = frame();
      for (const [l, f] of [
        ["L", "R"],
        ["R", "L"],
      ])
        expect(Math.hypot(...[0, 1, 2].map((d) => Pl.hands[l][d] - Pf.hands[f][d]))).toBeLessThan(0.005);
    }
  });

  it("arms keep their length", () => {
    load(moves.findIndex((m) => m.name === "Inside turn"));
    for (let t = 0; t < 8; t += 0.25) {
      setTime(t);
      const { shapes } = frame();
      for (const id of ["l", "f"])
        for (const sd of ["L", "R"]) {
          const up = shapes.find((s) => s.id === id && s.part === "upper" && s.side === sd)!;
          const len = Math.hypot(...[0, 1, 2].map((d) => (up.a as number[])[d] - (up.b as number[])[d]));
          expect(len).toBeGreaterThan(0.3);
          expect(len).toBeLessThan(0.36);
        }
    }
  });
});

describe("maths", () => {
  it("segmentDistance", () => {
    expect(segmentDistance([0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0])[0]).toBeCloseTo(1);
    expect(segmentDistance([0, 0, 0], [1, 0, 0], [0.5, -1, 0], [0.5, 1, 0])[0]).toBeCloseTo(0);
    expect(segmentDistance([0, 0, 0], [0, 0, 0], [3, 4, 0], [3, 4, 0])[0]).toBeCloseTo(5);
  });
  it("mono interpolation never overshoots its two middle points", () => {
    for (let s = 0; s <= 1; s += 0.1) {
      const v = mono(0, 1, 1, 5, s);
      expect(v).toBeGreaterThanOrEqual(1 - 1e-9);
      expect(v).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
  it("wrapDeg keeps angles within half a turn", () => {
    expect(wrapDeg(190)).toBe(-170);
    expect(wrapDeg(-190)).toBe(170);
    expect(wrapDeg(360)).toBe(0);
  });
});
