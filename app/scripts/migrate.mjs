// One-off: split the old single-file script (legacy/index.html) into engine modules.
// Kept for the record; the generated files are then edited by hand and are the source of truth.
import fs from "node:fs";
const L = fs.readFileSync(new URL("../../legacy/index.html", import.meta.url), "utf8").split("\n");
const cut = (a, b) => L.slice(a - 1, b).join("\n");
const exp = (s) => s.replace(/^(function|const|let) /gm, "export $1 ");
const find = (re, from = 1) => { for (let i = from - 1; i < L.length; i++) if (re.test(L[i])) return i + 1; throw new Error("not found " + re); };
const w = (f, s) => fs.writeFileSync(new URL("../src/" + f, import.meta.url), s + "\n");

const iMoves = find(/^const moves=\[/), iNear = find(/^const nearTh=/), iDollar = find(/^const \$=/);
const iWrap = find(/^const wrapDeg=/), iShoulder = find(/^function shoulder/), iPrepare = find(/^function prepare/);
const iAnchorC = find(/^\/\/ hand positions that sit on one dancer/), iGet = find(/^function get\(/), iIk = find(/^function ik\(/);
const iShade = find(/^function shade\(/), iTint = find(/^function tint\(/), iDarker = find(/^const darker=/);
const iFS = find(/^const FS=/), iBody = find(/^function body\(/), iDrawHead = find(/^\/\/ Draws a head/);

w("engine/core.ts", [
  "// Small shared pieces: angles, interpolation, the footwork table and the builders used to write moves.",
  exp(cut(351, iMoves - 2)), exp(cut(iWrap, iShoulder - 1)), exp(cut(iIk, iShade - 1)), exp(cut(iTint, iDarker - 1)),
].join("\n"));

w("moves/library.ts", [
  "// The choreography: every move as data, one key per count.",
  'import { R, L0, F0, two, LP, KB, K, T, TP, TB, B } from "../engine/core";',
  exp(cut(iMoves, iDollar - 1)),
].join("\n"));

w("engine/bodyshape.ts", [
  "// Body sizes and the torso outline. Drawing, arm placement and the collision checks all read these.",
  'import { vec, lerp, clamp } from "./core";',
  exp(cut(iFS, iBody - 1)),
].join("\n"));

w("engine/hands.ts", [
  "// Where a named hand position is in space.",
  'import { vec } from "./core";',
  exp(cut(iShoulder, iPrepare - 1)), exp(cut(iAnchorC, iGet - 1)),
].join("\n"));

w("engine/sim.ts", [
  "// Turns a move (one key per count) into continuous motion: feet, hips, facing and hand targets at any time t.",
  'import { vec, FW, wrapDeg, lerp, lerp3, ease, clamp, mono } from "./core";',
  'import { FS, DIMS, bodyGap } from "./bodyshape";',
  'import { ANCHOR, connPos, restHand } from "./hands";',
  'import { moves } from "../moves/library";',
  "let NL = false, bad = false, FL: any = {}, mi = 0, t = 0, keys: any[] = [], N = 8;",
  cut(iPrepare, iAnchorC - 1), cut(iGet, iIk - 1),
  "export { prepare, pose, kin, get };",
].join("\n"));

w("engine/figure.ts", [
  "// Builds a dancer's body for one moment: a list of simple shapes (capsules, balls, panels) in meters.",
  'import { vec, lerp, lerp3, clamp, ik, tint } from "./core";',
  'import { DIMS, LEG, PROFS, bodyGap } from "./bodyshape";',
  exp(cut(iBody, iDrawHead - 1))
    .replace("function body(P,col,items,isLead){", "function body(P,col,items,isLead,env){")
    .replace("colors.skin||'#E6C1A3'", "env.skin").replace("colors.hair||'#2A1F1C'", "env.hair").replace("Math.sin(3*a+t*3)", "Math.sin(3*a+env.time*3)"),
].join("\n"));
console.log("split done");
