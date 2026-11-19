// Records today's known problems per move in tests/known-issues.json.
// The test suite then fails when a NEW problem appears or a known one gets worse, and reminds you to
// re-record when one is fixed. Run after deliberately fixing or accepting something:
//   npx vite-node scripts/budgets.ts
import fs from "node:fs";
import { moves } from "../src/engine";
import { collisions, jumps, footSliding, footReach } from "../src/checks";

const out: Record<string, any> = {};
for (let i = 0; i < moves.length; i++) {
  const amounts = (f: Record<string, { amount: number }>) =>
    Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.amount]));
  const s = footSliding(i),
    r = footReach(i);
  out[moves[i].name] = {
    collisions: amounts(collisions(i)),
    mistakeCollisions: moves[i].mistake ? amounts(collisions(i, true)) : undefined,
    jumps: amounts(jumps(i)),
    sliding: { l: s.l.amount, f: s.f.amount },
    reach: { l: r.l.amount, f: r.f.amount },
  };
  console.log("recorded", moves[i].name);
}
fs.writeFileSync(new URL("../tests/known-issues.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
