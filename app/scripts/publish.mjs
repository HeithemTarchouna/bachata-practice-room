// After a build: copy the single-file app to the project root as index.html, the file you double-click.
// (The old single-file app is kept in legacy/.)
import fs from "node:fs";
const out = new URL("../../index.html", import.meta.url);
fs.copyFileSync(new URL("../dist/index.html", import.meta.url), out);
console.log("published", fs.statSync(out).size, "bytes ->", out.pathname);
