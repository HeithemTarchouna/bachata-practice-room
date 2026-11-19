// Prints every measurement for every move. Run: npx vite-node scripts/report.ts [collisions|jumps|sliding|reach]
import { moves } from "../src/engine";
import { collisions, jumps, footSliding, footReach } from "../src/checks";

const what = process.argv[2] ?? "all";
const cm = (x: number) => (x * 100).toFixed(1) + "cm";
for (let i = 0; i < moves.length; i++) {
  const name = moves[i].name;
  if (what === "all" || what === "collisions") {
    const c = collisions(i);
    console.log(
      "COLLISIONS",
      name,
      "::",
      Object.keys(c).length
        ? Object.entries(c)
            .map(([k, v]) => `${k} ${cm(v.amount)}@${v.at}`)
            .join("  ")
        : "clean",
    );
  }
  if (what === "all" || what === "jumps") {
    const j = jumps(i);
    console.log(
      "JUMPS",
      name,
      "::",
      Object.keys(j).length
        ? Object.entries(j)
            .sort((a, b) => b[1].amount - a[1].amount)
            .map(([k, v]) => `${k} ${v.amount}m/count@${v.at}`)
            .join("  ")
        : "smooth",
    );
  }
  if (what === "all" || what === "sliding") {
    const s = footSliding(i);
    console.log("SLIDING", name, "::", `leader ${cm(s.l.amount)}  follower ${cm(s.f.amount)}`);
  }
  if (what === "all" || what === "reach") {
    const r = footReach(i);
    console.log("REACH", name, "::", `leader ${cm(r.l.amount)}  follower ${cm(r.f.amount)}`);
  }
}
