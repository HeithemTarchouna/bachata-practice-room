// The quality gate for the dancing itself. For every move it measures what a viewer would object to:
// bodies passing through each other, teleporting joints, sliding feet, over-stretched legs.
// Known problems are listed in known-issues.json; anything new, or anything that got worse, fails.
import { describe, expect, it } from "vitest";
import { moves } from "../src/engine";
import { collisions, jumps, footSliding, footReach } from "../src/checks";
import known from "./known-issues.json";

const TOLERANCE = { collisions: 0.004, jumps: 0.4, sliding: 0.005, reach: 0.01 };

/** Every finding must be a known one, and no worse than recorded. */
function expectWithinBudget(
  found: Record<string, { amount: number; at: number }>,
  budget: Record<string, number> = {},
  slack: number,
) {
  const problems: string[] = [];
  for (const [what, f] of Object.entries(found)) {
    if (!(what in budget)) problems.push(`NEW: ${what} = ${f.amount} at count ${f.at}`);
    else if (f.amount > budget[what] + slack)
      problems.push(`WORSE: ${what} = ${f.amount} at count ${f.at} (was ${budget[what]})`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
}

// combos are chains of the single moves; they are covered by a lighter check below
const singles = moves.map((m, i) => ({ m, i })).filter(({ m }) => !m.combo);

describe.each(singles)("$m.name", ({ m, i }) => {
  const budget = (known as any)[m.name] ?? {};

  it("has no new or worse overlaps between bodies", () => {
    expectWithinBudget(collisions(i), budget.collisions, TOLERANCE.collisions);
  });

  it("never puts an arm or hand inside the partner", () => {
    const serious = Object.entries(collisions(i)).filter(([k]) => k.startsWith("IN "));
    const allowed = Object.keys(budget.collisions ?? {}).filter((k) => k.startsWith("IN "));
    expect(serious.map(([k]) => k).filter((k) => !allowed.includes(k))).toEqual([]);
  });

  it("has no teleporting or snapping joints", () => {
    expectWithinBudget(jumps(i), budget.jumps, TOLERANCE.jumps);
  });

  it("keeps planted feet planted", () => {
    const s = footSliding(i);
    expect(s.l.amount).toBeLessThanOrEqual((budget.sliding?.l ?? 0.01) + TOLERANCE.sliding);
    expect(s.f.amount).toBeLessThanOrEqual((budget.sliding?.f ?? 0.01) + TOLERANCE.sliding);
  });

  it("does not over-stretch a leg", () => {
    const r = footReach(i);
    expect(r.l.amount).toBeLessThanOrEqual((budget.reach?.l ?? 0.3) + TOLERANCE.reach);
    expect(r.f.amount).toBeLessThanOrEqual((budget.reach?.f ?? 0.3) + TOLERANCE.reach);
  });

  if (m.mistake)
    it("the common-mistake version has no new overlaps either", () => {
      expectWithinBudget(collisions(i, true), budget.mistakeCollisions, TOLERANCE.collisions);
    });
});

describe.each(moves.map((m, i) => ({ m, i })).filter(({ m }) => m.combo))("$m.name", ({ m, i }) => {
  it("has no teleporting or snapping joints, also where its sections join", () => {
    expectWithinBudget(jumps(i, 60), (known as any)[m.name]?.jumps, TOLERANCE.jumps);
  });
});
