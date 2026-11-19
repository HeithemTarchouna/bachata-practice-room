# Bachata practice room

A browser tool for practicing bachata partner moves on your own. Two 3D figures dance each move slowly, one
count at a time, seen from the leader's or the follower's side: what happens on which count, where the hands go, which way the
turn goes, and where everyone ends up.

It is a learning aid made by a beginner, not a reference. Directions and hand holds vary between teachers, and
no teacher has reviewed these moves yet. When in doubt, your teacher is right.

## Use it

Open `index.html` in a browser. That is the whole app in one file; nothing to install.

- Pick a move, step through the counts, read the cue for each one.
- Press Play at a slow tempo and dance along.
- Switch the camera: side, behind, top, or POV (through the leader's eyes).
- "Common mistake" shows what to avoid.
- Leader or follower: the dropdown in the top bar. Each gets their own cues, tips, footprints and POV.
- English or French: the dropdown next to it. It starts in your browser's language.

## What is in it

- Basics: side basic, basic in place, forward and back
- Moves: inside turn, outside turn, leader's turn, place swap, wrap, hammerlock
- A 64-count beginner combination, also split into its six sections
- Three shorter combos
- Real-motion mode: plays back two dancers traced from your own video (see `extract_poses.py`)

## Work on it

The app lives in `app/` (TypeScript, Vite, Three.js, Vitest).

```
cd app
npm install
npx vitest run          # 121 tests: structure, motion quality per move, texts
npx vite build          # builds one html file
node scripts/publish.mjs   # copies it to ../index.html
```

- `app/src/moves/` the choreography, as data: one entry per count
- `app/src/engine/` turns that data into motion; no browser needed
- `app/src/checks/` measurements: bodies passing through each other, teleporting joints, sliding feet
- `app/src/i18n/` texts: `follower.ts` gives each leader text in the follower's words, `fr.ts` and
  `fr-follower.ts` map each English text to French; tests fail when one is missing
- `app/src/render/` the 3D stage
- `app/src/ui/` the interface
- `tools/` Python scripts (Playwright) that test the built page and render it from six cameras or as a video
- `legacy/` the earlier single-file version

Known problems are listed in `app/tests/known-issues.json`; the tests fail when a new one appears or an old one
gets worse.
