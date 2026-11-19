// Every text the app can show must have a French translation.
import { describe, expect, it } from "vitest";
import html from "../index.html?raw";
import appSrc from "../src/ui/app.ts?raw";
import motionSrc from "../src/ui/motion.ts?raw";
import guidesSrc from "../src/render/guides.ts?raw";
import { moves } from "../src/engine";
import * as engine from "../src/engine";
import { fr } from "../src/i18n/fr";
import { follower, followerNotes } from "../src/i18n/follower";

describe("French", () => {
  it("covers every text of every move", () => {
    const need = new Set<string>();
    moves.forEach((m, i) => {
      const texts = [engine.shortName(i), engine.groupOf(i), m.about, ...m.tips, ...m.errors];
      if (m.mistake) texts.push(m.mistake.what, m.mistake.fix);
      if (m.start) texts.push(m.start.cue);
      for (const k of m.keys) texts.push(k.cue, k.seg ?? "");
      texts.filter(Boolean).forEach((t) => need.add(t));
    });
    expect([...need].filter((t) => !(t in fr))).toEqual([]);
  });

  it("covers the fixed texts of the page", () => {
    const need = [
      ...[...html.matchAll(/<(\w+)[^>]*\sdata-t>(.*?)<\/\1>/g)].map((m) => m[2]),
      ...[...html.matchAll(/(?:aria-label|title)="([^"]+)"/g)].map((m) => m[1]),
    ];
    expect(need.length).toBeGreaterThan(60);
    expect(need.filter((t) => !(t in fr))).toEqual([]);
  });

  it("covers the texts written by the interface code", () => {
    const need: string[] = [];
    for (const src of [appSrc, motionSrc, guidesSrc]) {
      for (const m of src.matchAll(/\bt[rf]\(\s*"((?:[^"\\]|\\.)*)"/g)) need.push(m[1]);
      // texts picked with a condition, e.g. tr(on ? "Pause" : "Play")
      for (const m of src.matchAll(/\bt[rf]\(\s*[\w.! ]+\?\s*"([^"]*)"\s*:\s*"([^"]*)"/g)) need.push(m[1], m[2]);
    }
    expect(need.length).toBeGreaterThan(30);
    expect(need.filter((t) => !(t in fr))).toEqual([]);
  });

  it("keeps the placeholders of each text", () => {
    const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    expect(Object.entries(fr).filter(([en, f]) => holes(en) !== holes(f))).toEqual([]);
  });
});

describe("Follower", () => {
  const notes = Object.values(followerNotes).flatMap((n) => [...n.tips, ...n.errors]);

  it("has her own wording for every count, description and mistake of every move", () => {
    const need = new Set<string>();
    for (const m of moves) {
      const texts = [m.about, ...m.keys.map((k) => k.cue)];
      if (m.mistake) texts.push(m.mistake.what, m.mistake.fix);
      if (m.start) texts.push(m.start.cue);
      texts.forEach((t) => need.add(t));
    }
    expect([...need].filter((t) => !(t in follower))).toEqual([]);
  });

  it("has her own tips and mistakes for every move", () => {
    expect(moves.filter((m) => !followerNotes[m.name]?.tips.length || !followerNotes[m.name]?.errors.length)).toEqual(
      [],
    );
  });

  it("never rewrites one of her own notes a second time", () => {
    expect(notes.filter((t) => t in follower)).toEqual([]);
  });

  it("is fully translated to French", () => {
    expect([...Object.values(follower), ...notes].filter((t) => !(t in fr))).toEqual([]);
  });
});
