# Bachata practice room

A browser tool for practicing bachata partner moves alone. It shows two 3D
figures (leader and follower) dancing a move count by count, with cues, guides,
a point-of-view camera, and a "common mistake" version of each move.

This file is the handoff from a long chat session. Read it before changing
anything.

## READ THIS FIRST: version 2 (rebuild started 2026-11-20)

The user asked for a proper rebuild: modules instead of one file, a real 3D
renderer, and a loop where the AI can verify motion itself. Status: the new
app runs and passes its tests, but it is NOT yet the default.

- `index.html` (root): still the OLD single-file app. Same file as
  `legacy/index.html`. Old tools are in `legacy/tools/`.
- `practice-room-v2.html` (root): the NEW app, built from `app/`. It replaces
  `index.html` only when the user agrees it is at least as good.
- Most of the sections below this one describe the OLD app's history. The
  dance logic was ported unchanged, so the choreography notes still apply.

### Layout of `app/` (TypeScript, Vite, Three.js, Vitest)

- `src/moves/library.ts`: every move as data. `types.ts` describes it.
- `src/engine/`: no DOM, runs in Node.
  - `core.ts` maths and move builders; `sim.ts` keys to continuous motion;
    `hands.ts` named hand positions; `bodyshape.ts` sizes and torso outline;
    `figure.ts` builds a body as plain shapes; `shapes.ts` shape types.
  - `bake.ts`: samples a whole move at 24 per count and smooths every joint
    over TIME, in two passes (smooth, then re-solve near the smoothed path).
    This is what removes teleports. The interface bakes in the background.
  - `index.ts`: the only door into the engine (`load`, `setTime`, `frame`).
- `src/checks/index.ts`: `collisions`, `jumps`, `footSliding`, `footReach`.
- `src/render/`: `stage.ts` (three layers: 2D floor, WebGL figures, 2D
  overlay), `figures.ts` (shapes to meshes; torso and skirt are surfaces),
  `camera.ts`, `guides.ts`.
- `src/ui/app.ts`: the interface. `motion.ts`: real-motion mode.
- `tests/`: `engine.test.ts` (data and maths), `motion.test.ts` (quality gate
  per move against `known-issues.json`).
- Engine files ported from the old script still have loose typing
  (`strict: false`, many `any`). New files are typed. Tightening is open work.

### The loop: run all of this before reporting anything

From `app/`:
1. `npx tsc --noEmit` then `npx vitest run` (113 tests, about 45 s).
2. `npx vite build; node scripts/publish.mjs` writes `practice-room-v2.html`.
3. From the project root: `python tools/test_app.py <a .poses.json>` (437
   interface checks on the built file).
4. LOOK: `python tools/views.py <move> out.png <times...>` gives six cameras
   (side, behind, top, POV, far side, front of her) per moment. Read it.
   `python tools/shot.py out.png 900 1000 <move> <count> pov light stage` for
   close-ups. `python tools/film.py <move> out.mp4` makes a real video
   (slow: about 1 s per frame).
5. Numbers per move: `npx vite-node scripts/report.ts [collisions|jumps|sliding|reach]`.
6. After deliberately fixing or accepting something:
   `npx vite-node scripts/budgets.ts` re-records `tests/known-issues.json`.

### Changes after the user's first look at v2 (2026-11-20)

- Hammerlock rewritten (v2 only). Principle: his right hand cannot travel
  around her, so it stays low and nearly still and SHE turns into it. Her left
  hand ends behind her back at her RIGHT hip (`hipBackR`), and she finishes at
  his right side, right hip to right hip (`HOLD` in the move), which is what
  lets his arm reach without passing through her. Result: no arm inside her,
  no stretch, no hand jump. Left over at the unwind (count 13.5): her legs
  brush 3.7 cm, her right foot moves at 4.7 m/count, her own arm passes 6 cm
  into her head. This geometry is my reasoning, NOT confirmed by the teacher.
- Wrap entry: the joined hand used to swing far out to her left (`leftHigh`),
  dragging her right arm over and behind her head, then snapping. It now
  comes down in front of her (`frontUp`, 1.97 m at count 6). Measured smooth
  and clean. By eye her right elbow is still raised beside her head around
  count 6.25; not behind her neck any more, but not elegant.
- The first list item under "Known problems" (hammerlock forearm) is fixed.
- `tools/test_app.py` now waits for the count to change instead of a fixed
  delay; it was flaky when the machine was busy.
### Known problems in v2 (all recorded in `tests/known-issues.json`)

- Hammerlock: his right forearm passes through her body around count 6.45
  (9.8 cm). The old teleport is gone; what is left is that the hand path is
  not physically possible at this distance. Needs a reference video of the teacher's
  hammerlock. Same class: "Hammerlock exit (course)" her right arm through his
  body at 2.2, "Her loop and turn (course)" his forearm in her body at 5.65.
- Own arm through own head, 4 to 6 cm, in inside turn, your turn, wrap.
- Three fast elbow sweeps (5 to 7 m per count): your turn 5.82, wrap 6.11,
  her loop and turn 5.65.
- Feet slide up to 4.5 cm in pivot turns (smoothing softened the landings).
- POV: slivers of the leader's own arm clip the camera on wrap counts 13-14.
- Figures in 3D were only tuned on a few poses; faces are simple.
## Who it's for and why

The user is a beginner leader taking private lessons. He practices alone and
wants to see each move from the leader's side: what happens on which count,
where the hands go, which way the turn goes, where everyone ends up. He will
drill from this tool, so **accuracy matters more than looks**: a wrong detail
becomes a wrong habit.

He prefers plain, direct language. No business talk.

## Files

- `index.html`: the whole app in one file (HTML, CSS, JS, canvas rendering).
  Open it directly in a browser. No build step, no dependencies except Google
  Fonts.
- `extract_poses.py`: runs a pose model (ultralytics YOLO pose) on a video and
  writes `<video>.poses.json` with 2D joints of the two dancers per frame. The
  app can load that file ("Load motion file").
- `make_sheet.py`: turns part of a video into timestamped contact sheets
  (grids of frames). Use it to look inside reference videos.
- `tools/check_collisions.py`: automated checker (Playwright). Run it after
  every change to move data or body code.
- `tools/screenshot.py`: screenshots the stage at chosen counts and views.

## How the app works

Everything is in the `<script>` of `index.html`.

**Coordinates.** x and z are the floor, y is up, units are roughly meters.
`th` is the facing angle in degrees: facing direction is `(sin th, cos th)` in
(x, z). Increasing `th` is a turn to the dancer's left (counterclockwise seen
from above). The leader starts at `L0` facing +x, the follower at `F0` facing
-x. All authored positions are multiplied by `S = 0.78` in `prepare()` to get a
realistic hold distance.

**Moves.** `moves` is an array. Each move has `keys`: one entry per count
(8 or 16), built with `K(leader, follower, hands, cue)`.
- A dancer is `{x, z, th}` plus a mode:
  - plain object: basic step (footwork from the `FW` table, 3 steps and a tap)
  - `T({...})`: traveling turn, feet planted and stepping (used in place swap)
  - `TP({...})`: pivot turn on the spot, drifting like the basic (turns)
  - `TB({...})`: turn with feet kept under the body, no drift (wrap)
  - `fw: 'place' | 'fwd'`: basic in place, or forward and back
- `hands` is a list of `[leaderHand, followerHand, type]`. Types are named
  points computed in `connPos()`: `mid`, `low`, `prep`, `earL`, `earR`, `halo`,
  `haloFwd`, `haloOut`, `haloLead`, `back`, `side`, `sideR`, `sideBackL`,
  `wrapFront`, `leftHigh`, `frontHigh`, and mistake-only ones (`haloFar`,
  `haloBig`, `face`, `backHigh`).
- `mistake`: optional. `flags` (`stiff`, `lookDown`, `big`, `far`, `noSpot`)
  and `swap` / `swapAt` to replace hand types on some counts.
- `combo(name, about, parts)` chains existing moves into one sequence.

**Animation.** `prepare()` builds a state per count. `pose()` interpolates
between counts with a monotone spline (no overshoot). `body()` builds the
figure with two-bone IK for knees and elbows, hip sway, spotting heads, and
pushes elbows around heads and the partner's torso. `draw()` projects and
depth-sorts. Guides: gold arrow (leader's left hand, next count), floor arc
(turn direction), outlined footprint with L/R (leader's next step, dashed =
tap).

**Real motion mode.** `loadMotion()` reads a `.poses.json`, `cleanMotion()`
drops bad detections, fills short gaps and smooths, `drawMotion()` draws flat
2D figures. It has tap-tempo counts, looping and mirror.

**Turn footwork (changed 2026-11-19).** Pivot turns (`TP`, `TB`) used to keep
both feet under the body and rotate them together, which looked like skating.
Now the standing foot stays planted and the body turns over it; the free foot
lifts, swings round on its own side and lands beside it (`prepare()` pivot
branch, `pose()` body path and `foot()`). On-the-spot turns (`TP`) may sit up
to 9 cm off their authored position, and their stepping foot is not allowed
to land across the standing foot. Travelling turns (`TB`) follow the authored
path within 2 cm. `soft:1` on a `TB` key gives it the no-crossing rule too.
Each foot also has its own direction now (`fL`/`fR` per key, `fth` in the pose): the landing foot points ahead into the turn, the standing foot holds its direction and only pivots when the hips are more than 50 degrees past it. The free foot stays down for the first fifth of the count, then lifts and lands on the count. Coming out of a turn, a basic key keeps the standing foot where it is (`adj`) so nothing slides back into place. `tools/filmstrip.py` makes zoomed frame strips for judging footwork, and `tools/check_feet.py index.html` reports how often both feet travel or rotate together.
`tools/check_sliding.py` measures how far feet move while on the floor: turns
went from 16 to 49 cm of slide per count to under 2 cm.

**Footwork review (2026-11-19).** the user rejected the first skating fix, so
judge footwork from `python tools/filmstrip.py <move> 0 7.875 0.125 side 1.7
out.png feet` (8 frames per count, camera at the feet), not from single
screenshots. Latest strips are in `screenshots/feet_strips/`. In turn mode the
follower now steps with mirrored feet (right foot first), like in the basic.
Outside turn follower x moved from .36 to .54 so the legs don't pass through
the leader. Still weak: Wrap entry (her trailing leg stretches like a lunge,
counts 5 to 6) and unwrap (her legs cross closely on 14), Place swap (leader's
legs narrow and stiff on 5 to 6), course cross-body lead (long reaching steps
on 7 to 8 and 14 to 15).

**Walking steps and re-timed turns (2026-11-19, later).** All turn modes
(`T`, `TP`, `TB`) now plant the standing foot. Travelling ones (`T`, `TB`)
take real walking steps: the stepping foot lands ahead of the body, the body
ends up between the feet, strides are capped at 36 cm (`prepare()`, branch
`cur.trav&&nw!==sup`). `cross:1` on a key allows a crossing step.
On-the-spot turns (`TP`) may land a foot in line with the standing foot, in
front or behind. Turn angles were re-timed so each step is a forward, back or
side step: quarter turn on 5, half turn on 6, quarter on 7 (inside, outside,
your turn, hammerlock). Before, most of the turn happened on 5, which forced
crossed steps. The teacher checked direction and counts, not these in-between
angles, so ask her.
Wrap: the leader now steps in place from count 5 to 16 (`LP`), and the basic
in the wrap is in place. She keeps her own footwork beside him (`flip` in
`dancer()`), so she never repeats a foot. Whether the teacher teaches the wrap basic
in place or travelling is NOT confirmed.
Place swap: more passing room, and her half turn is mostly on count 6.
Course cross-body lead: bigger side steps for him, wider swap circle.
`tools/check_feet.py` also reports the longest foot reach and widest foot gap
per move. Basic is 26 to 28 cm reach; every move is now at or under 32.

## Interface redesign and full course combination (2026-11-19, evening)

**Interface.** `index.html` now has an app layout: top bar (help dialog,
light/dark switch saved in localStorage), move library (sidebar on wide
screens, scrolling strip on small ones, with a count badge per move), stage
with camera and zoom buttons, a transport card (step, play, count timeline,
tempo slider with Slow/Medium/Song presets, Click and Guides toggles), and a
coaching column (current cue, next cue, do this, common mistakes, a
collapsible legend). Elements that only apply to the simulator carry the class
`simonly` and are hidden in real-motion mode. `tools/test_ui.py` clicks
through all of it (468 checks); run it after any page change.
`tools/pageshot.py` takes full-page screenshots at any size and theme.

**Course combination.** The whole 64-count sequence from the course is in the
app as "Course combination", and each 8-count section is also a separate move
under "From the course". Source of truth: `SEG` in `index.html`.
- Sections: basic, cbl (cross-body lead), lturn (her left turn), hturn (his
  left turn into the hammerlock), back (hammerlock exit), loopturn (her loop,
  then her left turn), hisloop (his loop, then a cross-body lead in closed
  hold), closed (basic in closed hold).
- `chainKeys()` joins sections: each is written as if the leader starts at
  home, and is rotated and shifted to start where the previous one ended.
  The old `combo()` uses it too.
- A move with a `start` key does not loop (`NL`): time runs 0 to N and jumps
  back. Count 0 is shown as "start".
- Hands can rest on the partner: a hand entry may name only one dancer, e.g.
  `['R',null,'bladeL']` (his right hand on her left shoulder blade).
- New contact points in `connPos()`: high, waistNear, sideBackR, frontL,
  crown, besideL, shoulderL, bladeL, ownShR, leadShL, leadNape, closed.
- `tools/compare_course.py SECTION out.png` puts the video frame next to the
  app at every count, from the same side. Count times in the video are in that
  file (slow run-through at 38:53, last part at 42:40). Sheets are in
  `screenshots/course_compare/`.
- Walking steps are judged against the direction the dancer faces when the
  step STARTS, and a stepping foot swings around the standing foot instead of
  through it. `cross:1` steps land in front.

Known gaps in the course moves: in the closed-hold cross-body lead the legs
overlap by up to 6 cm and his thigh enters her skirt by 11 cm for a moment
(counts 6 to 8 of that section). The close holds are a little wider than in
the video so knees don't clash. Exact hand shapes (fingertip hold, handshake)
are not modelled, only where the hands are. Nobody who dances has reviewed
these yet.

**Figure rendering (2026-11-19, late).** The figures are drawn with more
care; the motion and the collision shapes are untouched. In `body()`: rounded
shoulders, hips in the trouser colour, collar and a real neck for the leader;
bare shoulders above the dress for the follower; a hand shape that points
where the forearm points; eyes, nose and ears so facing is visible; a heel on
her shoes; an 18-panel skirt lit by where each panel faces. In `draw()`:
every limb has a soft light from the upper left and a thin darker edge
(`capGrad`, `ballGrad`, `edge`), the torso parts share one gradient (`tg`
flag) so they read as one body, the near half of the skirt always covers the
legs, each dancer has a soft floor shadow, and the grid fades with distance.
Rules for adding decoration: give it NO `part` (the collision checker only
looks at items with a `part`), and give small dots `torso:1` (dots under 3 cm
without it are counted as hands by the checker; `torso:1` also hides them in
POV). `flat:1` skips the shading. Before/after pictures:
`screenshots/figures/`.

**Fuller bodies and wrap fix (2026-11-20).** the user asked for more
realistic, fuller figures and accepted re-spacing the moves.
- Body sizes live in `DIMS` (per dancer: limb radii, head, hand, torso depth)
  and the torso outline in `PROF` inside `body()` (height, half width, depth,
  forward offset; 15 stacked bars sharing one gradient). The collision checker
  reads the same sizes, so thicker limbs are really tested. Limbs are roughly
  50% thicker than before; heads 10% bigger.
- `FS` (half the gap between standing feet) went from 6.5 to 8.2 cm and is
  used everywhere a foot is placed beside the other. `LEG` is the bone length.
- A stepping foot swings around the standing leg in every turn mode, with
  19 cm clearance. In pivot turns a foot never lands straight behind the other
  (min 8 cm sideways). A tap no longer shifts the body forward.
- Re-spaced for the new bodies: outside turn (her x .58), wrap, course
  cross-body lead, closed-hold cross-body lead, several hand points
  (`hipR`, `haloFwd`, `leftHigh`, `crown`, `leadNape`).
- Wrap fix: The user said the wrap had a mistake but not which. I found that
  the leader's right hand ended on her NEAR hip, so his arm was not around
  her. It now ends at her far (right) hip (`hipR`), arm behind her back, and
  stays low while she turns in. NOT confirmed that this was the mistake he
  meant: ask him.
- Remaining overlaps: skirt against his thigh in the wrap entry (5 cm), in the
  course hammerlock (6 cm) and in the closed-hold cross-body lead (9 cm, plus
  4 to 5 cm between legs); small self leg brushes (2 to 3 cm) in place swap
  and course cross-body lead. The skirt is cloth, so those matter least.

**Faces, hands and arm clipping (2026-11-20, later).** the user sent a POV
close-up and rightly called the face ugly, the hand hold horrible, and said
arms clip through her. Lesson: ALWAYS look at POV close-ups
(`tools/pageshot.py ... "document.querySelector('[data-v=pov]').click()"`),
not only small stills.
- Head: `drawHead()` draws skull and jaw as one outline, then eyes, brows,
  nose and a smile placed in 3D (they turn with the head and fade when it
  faces away). Her hair is one long shape down her back.
- Shoulders are shaded with the torso (`tg`) so they don't read as ball
  joints. `ne:1` on an item means no outline.
- Hands: the hand point is the PALM; the wrist sits 6 cm before it, so joined
  hands meet instead of crossing. Joined hands are offset so his palm is
  under and hers on top.
- Elbow solver in `body()`: scores every elbow position on the circle around
  the shoulder-hand line (natural hang, out of the partner's oval body, out of
  own head, in front of own chest) and blends the good ones; then a push as a
  last resort.
- Hands that rest on a body are stored relative to that body (`ANCHOR`,
  `HL`, `A` per key) and interpolated in its frame, so they stay on it while
  it turns between counts. Free hands are anchored to their own body.
- Waist contacts moved up to the waist (1.05 m) and to the side the arm comes
  round (`back`, `bladeL`, `sideBackL`...).
- The checker now reports `ARM x through y body` (forearm or upper arm inside
  the partner's drawn torso, over 3 cm). Remaining: hammerlock unwind 8 cm
  (his arm crosses in front of her waist on 13), closed hold entry 9.5 cm,
  others 4 to 5.5 cm. Not solved: a straight forearm can't wrap a waist.

**No arm or hand inside the partner (2026-11-20, evening).** the user: hands
still went inside her in wrap and hammerlock; check ALL views for EVERY move
before handing back. Rule from now on: `tools/check_collisions.py` must show
no `IN ...` entry for any move, and `tools/viewsheet.py` sheets (six cameras:
side, behind, top, POV, far side, front of her) must be looked at.
- Checker: `IN <who> <side> hand/forearm/upper arm in <partner> body/skirt/
  head/neck/leg` (over 1.5 cm) and `arm STRETCHED` (bones over 66 cm + 3).
- `bodyGap()` knows the real torso outline (`PROFS`), leaning from hips to
  chest. `kin(w)` gives a dancer's facing, hips, feet and chest.
- In `pose()`: a hand that is on a body at either end of a count travels
  around that body (angle and radius in its frame); targets are pulled into
  reach of every shoulder involved, pushed out of both bodies, and walked
  round the surface if still out of reach.
- In `body()`: a hand resting on the partner gets a lifted, bent wrist
  (`ancW` blend); the elbow solver uses `bodyGap` and avoids the partner's
  head; bones can't stretch more than 2 cm.
- Raised hands are at 1.9 m, not 2.0 (2.0 was out of reach and forced
  straight, stretched arms).
- `tools/diag_arms.py` traces a move moment by moment.
State: all 19 moves have zero `IN` entries in the good version. Wrap mistake
version: 1.5 cm forearm/head and a 5.6 cm stretch (the mistake is the hand
across her face). Other leftovers are legs and skirt, 1 to 4 cm.
Sheets: `screenshots/all_views/`.

**Hammerlock hand teleport: NOT fixed (2026-11-20, night).** the user saw his
right hand go to her right hip, then teleport to her left hip.
`tools/check_motion.py` (new: speed of every hand, elbow, foot, head at 1/120
count; exits 1 on any jump) confirmed a 42 m/count jump at count 6.59. I
re-routed the hand along her left side to the middle of her back (`backC`),
which is closer to right but still jumps (38 m/count at 6.44). Two causes:
(1) the reach/outOf/round projection in `pose()` is discontinuous; (2) I do
not actually know the real hand path of the teacher's hammerlock through a full
right turn, and at 55 cm apart his hand cannot stay behind her back while she
comes round to face him. Needs a reference (lesson video) before more
guessing. `check_motion.py` also reports elbow snaps of 15 to 60 m/count in
most turning moves: those are real visible jerks, not yet addressed.
The user also asked: why one file, are these the right frameworks, and for a
loop where the AI can really see motion. Proposed (awaiting his go): rewrite
as TypeScript modules with Vite (built to one file), Three.js rendering,
moves as data, unit tests, the checkers as a test suite.

## Verification workflow

1. `pip install playwright` and `python -m playwright install chromium` once.
2. After any change: `python tools/check_collisions.py` and
   `python tools/check_sliding.py`. Each line is one move.
   `{}` means clean. Current state: everything clean except
   - Place swap: brief brush of the leader's own shins around count 5 to 6,
     and a small partner leg brush on the way back (2 to 4 cm)
   - Wrap: a slight follower forearm/head touch on entry (2 cm), and since
     the footwork change a 3 cm brush of her own shins after count 6
   - Wrap, mistake mode: hand across her face. That one is deliberate.
   - Since the footwork change: her own shins brush in the outside turn
     (1.5 cm, count 5) and the hammerlock (3 cm, count 5); "Your turn" mistake
     mode has a 1 cm upper arm/head touch
   - Cross-body lead (course): 3 cm brush of the leader's own legs on the
     cross step at count 10
3. Look at it: `python tools/screenshot.py "[(3,5.5,'side',0)]" out.png`.
   Move indexes follow the order of the chips in the page. `__seek(t)` is
   exposed on `window` for tests.

Never report something as fixed or correct without running the checker and
looking at screenshots. Say plainly what was and wasn't verified.

## What has been checked against references

Checked against written dance references and the user's own lesson videos with
his teacher, the teacher:
- Side basic: leader starts left, 3 steps and a tap, follower mirrors.
- Inside turn (she turns left) and outside turn (she turns right), led with
  the leader's left hand; prep on 4 near her left ear (inside) or right ear
  (outside); turn on 5-6-7; small halo.
- Leader's turn: right turn under the joined hands, as in his lesson.
- Place swap (cross-body lead): takes 8 counts. Leader steps back on the left
  and turns left to open her path, she walks straight across in front of him
  on 1-2-3 and turns to face him on 5-6-7.
- Wrap (cuddle): both hands kept, she turns left into his right side, standing
  slightly ahead of him; unwrap with a right turn.
- Hammerlock: the two-hand version. She turns right, her LEFT hand ends behind
  her back held by his right. This is the version the teacher teaches.

Things that vary by teacher and are not confirmed: the leader's footwork
during her turns (side basic vs in place), exact hand placement in the wrap,
some place swap details. The teacher has not reviewed the tool yet. Her sign-off is
the real acceptance test.

## Course video comparison (first pass, 2026-11-19)

The course file is "Bachata Tutorial For Couples - Demetrio & Nicole". It
teaches one long combination, not separate moves. `course_transcript.txt` is a
local speech-to-text transcript with timestamps (machine made, has errors).
Frame sheets are in `sheets/`.

Where things are in the video:
- 2:28 to 3:31: hand hold (his palms up, her hands resting on top) and side
  basic. Matches the app.
- 3:31 to 8:30: cross-body lead. DIFFERENT variant from the app's Place swap:
  both hands kept, he steps out of her lane to his left on 1-2-3-4 (crossing on
  2) while she does a normal basic, then on 5-6-7-8 he brings her through and
  the couple swaps sides turning clockwise.
- 8:30 to 13:10: her left turn. Same as the app's Inside turn. One difference
  found and fixed: his right hand stays connected low during the prep on 4 and
  lets go as she starts turning on 5 (the app let go on 4).
- 13:10 to 19:25: leader's turn. DIFFERENT variant from "Your turn": he turns
  to his LEFT on 1-2-3-4, traveling, lets go on 3 with the hand at his waist,
  and reconnects in a handshake hold. Not under raised joined hands.
- 19:25 to 25:00: hammerlock. DIFFERENT variant: from the handshake he pulls
  her forward on 5-6-7-8, she does a half turn left and her arm ends behind
  her back; then he sends her back the other way on 1-2-3-4.
- 29:40 to 36:15: loops and closed position. Not in the app.
- Not taught in this video: outside turn, wrap, forward & back.

The three DIFFERENT variants were NOT changed in the app, because the app's
versions follow the teacher's lessons. The user agreed to add the course versions as
extra moves, labelled "(course)".

Added so far: "Cross-body lead (course)", chip index 9 (the combos moved to
10, 11, 12). It is a rough first version from small frames. Leader side steps
with a cross on 2 (T mode), then both walk a tight clockwise swap on 5-6-7-8
(TB mode, so feet slide under the body instead of planting). The couple ends
on the line the leader stepped to, not the starting line. Checker: clean
except a 3 cm brush of the leader's own legs on the cross step at count 10.
Two small engine additions were needed: a key can carry `ax` (basic travel
axis override, for a follower basic when the leader is not in basic mode) and
a turn-mode dancer can carry `mir:1` (follower footedness: right foot first).
Existing turn-mode followers (Place swap, Wrap) still step with leader
footedness; not checked or changed.

Not added yet: the course's leader turn and hammerlock. In the course they
are chained (his turn ends in a handshake hold, the hammerlock starts from it
and only exits through loops into closed position), so they can't be looped
as stand-alone moves without modelling most of the combination.

## Known weaknesses

- Motion is hand-authored from one pose per count, so it looks mechanical.
- The place swap is the least polished move.
- Real motion mode is flat 2D and depends on video quality. The first test
  used a 368x672 compressed clip with a dancer half out of frame and looked
  poor even after cleanup.
- The user felt the loop "he spots something wrong, it gets fixed" was not a
  good process. He is a beginner and cannot be the judge of correctness.

## Direction agreed for the next phase

1. Use good reference video as ground truth instead of his eye. He has a
   beginner couples course as a local file in this folder (not part of the
   project, do not commit it). Use `make_sheet.py` to find and inspect each
   move, compare with the model, fix differences, rerun the checker.
2. Investigate estimating 3D body pose from ordinary video (ideally two
   camera angles) so real movement can drive the 3D figures. Research current
   tools before promising anything. Prove it on one move (basic + inside turn)
   before scaling.
3. Keep the teaching layer (counts, cues, guides, mistakes, combos, POV) on
   top of whatever drives the motion.
4. If this is ever shared with other people, the motion should come from
   recordings he has the rights to (his own, or a teacher who agrees).

## Working rules

- Small, verifiable steps. Run the checker and take screenshots yourself
  rather than asking him to test every change.
- Do the manual work for him: he moved to Claude Code because the chat needed
  too much hand-holding.
- Tell him honestly when something is a rough approximation.
- UI text: plain, short, sentence case. Typographic apostrophes in visible
  text.
