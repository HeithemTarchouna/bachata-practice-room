// The choreography: every move as data, one key per count.
import { R, L0, F0, two, LP, KB, K, T, TP, TB, B } from "../engine/core";
import type { Move, Key, Section, HandLink } from "./types";
export const moves: Move[] = [
  {
    name: "Side basic",
    about: "The base of everything: 3 steps and a tap to your left, then to your right. Learn this first.",
    keys: B.map((c) => K(L0, F0, two, c)),
    tips: [
      "Soft knees the whole time. Your hips move because your knees bend.",
      "Steps no wider than your shoulders.",
      "Tap means no weight. You should be able to lift that foot instantly.",
      "Eyes on her, never on your feet.",
    ],
    errors: [
      "Locked knees, big steps, looking down (shown in the mistake view).",
      "Putting weight on the tap, so you start the next 4 on the wrong foot.",
      "Moving the shoulders as much as the hips. The upper body stays calm.",
    ],
    mistake: {
      flags: { stiff: 1, lookDown: 1, big: 1 },
      what: "Locked knees, giant steps, eyes on the floor.",
      fix: "Soft knees, small steps, eyes on her.",
    },
  },
  {
    name: "Basic in place",
    about:
      "The same rhythm without traveling: 3 small steps and a tap, on the spot. Good for tight dance floors and for slow songs.",
    keys: [
      "Step left, on the spot.",
      "Step right.",
      "Step left.",
      "Tap right: no weight, hip pops.",
      "Step right.",
      "Step left.",
      "Step right.",
      "Tap left: no weight.",
    ].map((c) => KB(c, "place")),
    tips: [
      "Same rhythm as the side basic, the feet just stay under you.",
      "Keep changing weight fully on every step.",
      "The hips keep moving even though you don't travel.",
    ],
    errors: ["Marching with stiff knees.", "Bouncing up and down instead of moving the hips side to side."],
  },
  {
    name: "Forward & back",
    about:
      "3 steps forward and a tap, then 3 steps back and a tap. She mirrors you: when you go forward, she goes back.",
    keys: [
      "Step forward on your left. She steps back.",
      "Step forward right.",
      "Step forward left.",
      "Tap right beside your left foot.",
      "Step back on your right. She comes forward.",
      "Step back left.",
      "Step back right.",
      "Tap left.",
    ].map((c) => KB(c, "fwd")),
    tips: [
      "Small steps: she is walking backward and can't see where she's going.",
      "Move your body first, the arms just follow. Don't push her with your hands.",
      "Keep the same distance between you the whole time.",
    ],
    errors: ["Big steps that run her over.", "Pushing and pulling with the arms.", "Looking at your feet."],
  },
  {
    name: "Inside turn",
    about: "She turns to her left under your left hand. Prep on 4, turn on 5-6-7.",
    keys: [
      K(L0, F0, two, "Basic. Eyes on her, not your feet."),
      K(L0, F0, two, "Close."),
      K(L0, F0, two, "Step. Decide now."),
      K(
        L0,
        F0,
        [
          ["L", "R", "earL"],
          ["R", "L", "low"],
        ],
        "Tap + prep: bring your left hand up near her LEFT ear. Your right hand stays low, still holding hers.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.36, z: 0, th: 5 }),
        [["L", "R", "halo"]],
        "Let go with your right hand. Left hand goes up over HER head. She turns to her left.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.36, z: 0, th: 185 }),
        [["L", "R", "halo"]],
        "Small circle right above her head.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.38, z: 0, th: 270 }),
        [["L", "R", "prep"]],
        "Hand comes down as she faces you again.",
      ),
      K(L0, { ...F0, th: 270 }, two, "Tap: catch both hands. Back to basic."),
    ],
    tips: [
      "Prep on the tap (4), turn on 5-6-7, catch on 8.",
      "Hand path: up, small circle above her head, down.",
      "Step a little closer during the turn so your arm stays soft.",
      "Fingers loose. Think “hook,” not “grip.”",
    ],
    errors: [
      "Too far apart with a stretched arm (shown).",
      "Prep too late: decide on 3, prep on 4.",
      "Gripping her hand so she can’t spin inside it.",
    ],
    mistake: {
      flags: { far: 1 },
      swap: { halo: "haloFar" },
      what: "Too far apart, arm stretched at shoulder height. She has to duck under your arm.",
      fix: "Step in. Hand up and over HER head, elbow soft.",
    },
  },
  {
    name: "Outside turn",
    about: "Same as the inside turn, but she turns to her right. Learn it after the inside turn.",
    keys: [
      K(L0, F0, two, "Basic. Eyes up."),
      K(L0, F0, two, "Close."),
      K(L0, F0, two, "Step. Decide now."),
      K(L0, F0, [["L", "R", "earR"]], "Tap + prep: let go right. Bring your left hand up near her RIGHT ear."),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.58, z: 0, th: -185 }),
        [["L", "R", "halo"]],
        "Hand up over her head. She turns to her right.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.58, z: 0, th: -365 }),
        [["L", "R", "halo"]],
        "Small clockwise circle above her head.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.54, z: 0, th: -450 }),
        [["L", "R", "prep"]],
        "Hand comes down as she faces you.",
      ),
      K(L0, { ...F0, th: -450 }, two, "Tap: both hands. Basic."),
    ],
    tips: [
      "Same hand and timing as the inside turn.",
      "Only the direction changes: clockwise halo, she turns to her right.",
      "If she goes the wrong way, your prep was unclear. Start the small torso turn earlier.",
    ],
    errors: [
      "A big stirring circle instead of a halo (shown).",
      "The same prep as the inside turn, so she has to guess.",
      "Pushing her hand toward her face.",
    ],
    mistake: {
      swap: { halo: "haloBig" },
      what: "A big stirring circle instead of a small halo. It pulls her off balance.",
      fix: "Keep the circle small, right above her head.",
    },
  },
  {
    name: "Your turn",
    about: "You turn to your right under your joined hands while she keeps dancing.",
    keys: [
      K(L0, F0, two, "Basic."),
      K(L0, F0, two, "Close."),
      K(L0, F0, two, "Step. Decide now."),
      K(L0, F0, [["L", "R", "prep"]], "Tap + prep: let go right, lift left."),
      K(
        TP({ x: -0.4, z: 0, th: -5 }),
        { x: 0.38, z: 0, th: -90 },
        [["L", "R", "haloLead"]],
        "Hand above YOUR head. Turn right, eyes stay on her.",
      ),
      K(
        TP({ x: -0.4, z: 0, th: -185 }),
        { x: 0.38, z: 0, th: -90 },
        [["L", "R", "haloLead"]],
        "Whip your head around. Find her face first.",
      ),
      K(
        TP({ x: -0.4, z: 0, th: -270 }),
        { x: 0.38, z: 0, th: -90 },
        [["L", "R", "mid"]],
        "Body catches up with your eyes. Facing her.",
      ),
      K({ ...L0, th: -270 }, F0, two, "Tap: both hands back."),
    ],
    tips: [
      "Your hand goes above YOUR head, not hers.",
      "Spotting: eyes on her as long as possible, whip the head, find her again. Watch it in POV.",
      "Small steps in place, feet under your body.",
    ],
    errors: [
      "No spotting: the head turns with the body (shown).",
      "Feet wide apart while turning, so you wobble.",
      "Letting go of her hand.",
    ],
    mistake: {
      flags: { noSpot: 1 },
      what: "No spotting: your head turns with your body, so you get dizzy and lose her.",
      fix: "Eyes stay on her, then the head whips around before the body.",
    },
  },
  {
    name: "Place swap",
    about: "Cross-body lead: you step out of her way and she walks across to your side. 8 counts there, 8 counts back.",
    keys: [
      K(
        T({ x: -0.48, z: 0.1, th: 130 }),
        T({ x: 0.28, z: 0, th: -90 }),
        [["L", "R", "prep"]],
        "Step back on your left and start turning left. You open the door.",
      ),
      K(
        T({ x: -0.5, z: 0.46, th: 180 }),
        T({ x: 0.08, z: 0, th: -90 }),
        [["L", "R", "prep"]],
        "Keep turning: you're now beside her path. Guide her forward.",
      ),
      K(
        T({ x: -0.42, z: 0.7, th: 180 }),
        T({ x: -0.14, z: 0, th: -90 }),
        [["L", "R", "prep"]],
        "She walks straight past, in front of you.",
      ),
      K(
        T({ x: -0.42, z: 0.7, th: 180 }),
        T({ x: -0.3, z: 0, th: -90 }),
        [["L", "R", "prep"]],
        "Tap. She's crossing to the other side.",
      ),
      K(
        T({ x: -0.27, z: 0.66, th: 210 }),
        T({ x: -0.56, z: 0, th: -75 }),
        [["L", "R", "prep"]],
        "Turn to follow her. She starts her half turn to the left.",
      ),
      K(
        T({ x: -0.03, z: 0.34, th: 240 }),
        T({ x: -0.76, z: 0, th: 40 }),
        [["L", "R", "mid"]],
        "She keeps turning to face you.",
      ),
      K(
        T({ x: 0.1, z: 0, th: 270 }),
        T({ x: -0.8, z: 0, th: 90 }),
        [["L", "R", "mid"]],
        "Facing each other again, on swapped sides.",
      ),
      K(
        T({ x: 0.1, z: 0, th: 270 }),
        T({ x: -0.8, z: 0, th: 90 }),
        [["L", "R", "prep"]],
        "Tap + prep: get ready to go back.",
      ),
      K(
        T({ x: 0.16, z: -0.1, th: 310 }),
        T({ x: -0.66, z: 0, th: 90 }),
        [["L", "R", "prep"]],
        "Same way back: step back on your left, turn left.",
      ),
      K(
        T({ x: 0.18, z: -0.46, th: 360 }),
        T({ x: -0.4, z: 0, th: 90 }),
        [["L", "R", "prep"]],
        "Keep turning, open her path.",
      ),
      K(
        T({ x: 0.1, z: -0.7, th: 360 }),
        T({ x: -0.18, z: 0, th: 90 }),
        [["L", "R", "prep"]],
        "She walks straight past, in front of you.",
      ),
      K(T({ x: 0.1, z: -0.7, th: 360 }), T({ x: -0.02, z: 0, th: 90 }), [["L", "R", "prep"]], "Tap. She's crossing."),
      K(
        T({ x: -0.05, z: -0.66, th: 390 }),
        T({ x: 0.24, z: 0, th: 105 }),
        [["L", "R", "prep"]],
        "Turn to follow her. She starts her half turn.",
      ),
      K(
        T({ x: -0.29, z: -0.34, th: 420 }),
        T({ x: 0.4, z: 0, th: 220 }),
        [["L", "R", "mid"]],
        "She keeps turning to face you.",
      ),
      K(
        T({ x: -0.42, z: 0, th: 450 }),
        T({ x: 0.42, z: 0, th: 270 }),
        [["L", "R", "mid"]],
        "Home again, facing each other.",
      ),
      K(
        T({ x: -0.42, z: 0, th: 450 }),
        T({ x: 0.42, z: 0, th: 270 }),
        [["L", "R", "prep"]],
        "Tap + prep: ready to go again.",
      ),
    ],
    tips: [
      "Your first step is BACK on your left, while you turn to your left. That opens her path.",
      "She walks straight across in front of you on 1-2-3, and turns to face you on 5-6-7. Take all 8 counts, don't rush it.",
      "Keep the joined hand at chest height and guide her across with your body, don't pull.",
    ],
    errors: [
      "Stiff legs and big walking steps (shown).",
      "Staying on her line, so she has to walk around you.",
      "Squeezing the whole move into 3 counts. It takes 8.",
    ],
    mistake: {
      flags: { stiff: 1, big: 1 },
      what: "Stiff legs and big steps. You stop dancing and just walk.",
      fix: "Keep small bachata steps and soft knees while you pass.",
    },
  },
  {
    name: "Wrap",
    about:
      "You turn her into your right arm. She ends at your right side with your arm around her back and her own arms crossed in front. Then you unwrap her. 16 counts.",
    keys: [
      K(L0, F0, two, "Basic, both hands."),
      K(L0, F0, two, "Close."),
      K(L0, F0, two, "Step. Decide now."),
      K(
        L0,
        F0,
        [
          ["L", "R", "prep"],
          ["R", "L", "mid"],
        ],
        "Tap + prep: keep both hands. Lift your left hand.",
      ),
      K(
        LP,
        TB({ x: 0.18, z: -0.05, th: -25 }),
        [
          ["L", "R", "haloFwd"],
          ["R", "L", "frontC"],
        ],
        "Left hand over her head. She turns left, toward your right side.",
      ),
      K(
        LP,
        TB({ x: 0.02, z: 0.3, th: 40 }),
        [
          ["L", "R", "frontUp"],
          ["R", "L", "frontRt"],
        ],
        "Hand comes down in FRONT of her, a forearm away from her face, then to her chest. Never across her face.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "wrapFront"],
          ["R", "L", "hipR"],
        ],
        "She lands at your right side, facing the same way. Your right arm is now around her back.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "wrapFront"],
          ["R", "L", "hipR"],
        ],
        "Tap: you’re in the wrap. Arms relaxed.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "wrapFront"],
          ["R", "L", "hipR"],
        ],
        "Basic together in the wrap. Your right hand holds her left hand at her far hip.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "wrapFront"],
          ["R", "L", "hipR"],
        ],
        "Close.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "wrapFront"],
          ["R", "L", "hipR"],
        ],
        "Step. Decide now.",
      ),
      K(
        LP,
        { x: -0.24, z: 0.56, th: 90, fw: "place" },
        [
          ["L", "R", "frontHigh"],
          ["R", "L", "hipR"],
        ],
        "Tap + prep: lift your left hand first, out in front of her.",
      ),
      K(
        LP,
        TB({ x: 0, z: 0.36, th: 50 }),
        [
          ["L", "R", "haloFwd"],
          ["R", "L", "frontRt"],
        ],
        "Hand goes up. She unwinds to her right.",
      ),
      K(
        LP,
        TB({ x: 0.18, z: 0.17, th: -30 }),
        [
          ["L", "R", "halo"],
          ["R", "L", "frontC"],
        ],
        "Right hand stays low and soft. It’s her anchor.",
      ),
      K(LP, TB({ ...F0, th: -90 }), two, "She lands back in front of you."),
      K(LP, { ...F0, fw: "place" }, two, "Tap: open position again."),
    ],
    tips: [
      "Keep both hands the whole time.",
      "Your right hand stays low. As she turns she rolls into your right arm: it ends behind her back, with her left hand in yours at her right hip.",
      "Hand path: up over her head, down in front of her, then in front of her chest.",
      "In the wrap: a hug, not a seatbelt.",
      "To unwrap, lift the left hand first. The right hand stays low.",
    ],
    errors: [
      "Hand coming down across her face (shown).",
      "Squeezing her in the wrap.",
      "Unwrapping with the right hand first.",
    ],
    mistake: {
      swapAt: { 6: { frontUp: "face" }, 5: { haloFwd: "halo" } },
      what: "Your hand comes down across her face on 6.",
      fix: "Up over her head, then down in FRONT of her chest.",
    },
  },
  // Hammerlock. The physics that decides everything here: your right hand cannot travel around her. It stays low,
  // roughly where it is, and SHE turns into it. After her right turn her left arm is folded behind her back and her
  // left hand sits at her RIGHT hip, in your right hand. For your arm to reach that without going through her, she
  // finishes a little to your right: right hip to right hip. (Nothing in this move may jump: see tests.)
  (() => {
    const HOLD = { x: 0.14, z: 0.34, th: -450, fw: "place" } as const; // at your right side, facing you
    const MID_TURN = { x: 0.32, z: 0.18 }; // on her way there, her right side toward you
    const inHold: HandLink[] = [
      ["L", "R", "mid"],
      ["R", "L", "hipBackR"],
    ];
    return {
      name: "Hammerlock",
      about:
        "She turns to her right with BOTH hands kept. Your right hand stays low, so her left arm folds behind her back and her left hand ends at her right hip. She finishes at your right side, facing you. Then she unwinds. 16 counts.",
      keys: [
        K(L0, F0, two, "Basic, both hands."),
        K(L0, F0, two, "Close."),
        K(L0, F0, two, "Step. Decide now."),
        K(
          L0,
          F0,
          [
            ["L", "R", "earR"],
            ["R", "L", "low"],
          ],
          "Tap + prep: keep BOTH hands. Left hand up near her right ear, right hand stays low.",
        ),
        K(
          LP,
          TP({ x: 0.42, z: 0, th: -185 }),
          [
            ["L", "R", "halo"],
            ["R", "L", "side"],
          ],
          "Left hand over her head: she turns to her RIGHT. Your right hand stays low, at her left side.",
        ),
        K(
          LP,
          TP({ ...MID_TURN, th: -365 }),
          [
            ["L", "R", "halo"],
            ["R", "L", "backR"],
          ],
          "Don’t move your right hand: she turns into it. Her left arm folds behind her back.",
        ),
        K(
          LP,
          TP({ ...HOLD, fw: undefined }),
          [
            ["L", "R", "prep"],
            ["R", "L", "hipBackR"],
          ],
          "She faces you again, a little to your right. Her left hand is at her right hip, behind her back.",
        ),
        K(LP, HOLD, inHold, "Tap: you’re in the hammerlock. Right hip to right hip, left hands low in front."),
        K(LP, HOLD, inHold, "Basic in the hammerlock, small steps, close and relaxed."),
        K(LP, HOLD, inHold, "Close."),
        K(LP, HOLD, inHold, "Step. Decide now."),
        K(
          LP,
          HOLD,
          [
            ["L", "R", "earL"],
            ["R", "L", "hipBackR"],
          ],
          "Tap + prep: lift your left hand near her left ear to unwind.",
        ),
        K(
          LP,
          TP({ ...MID_TURN, th: -355 }),
          [
            ["L", "R", "halo"],
            ["R", "L", "backR"],
          ],
          "She unwinds to her LEFT under your left hand. Your right hand still stays low.",
        ),
        K(
          LP,
          TP({ x: 0.42, z: 0, th: -175 }),
          [
            ["L", "R", "halo"],
            ["R", "L", "side"],
          ],
          "Her arm unfolds: your right hand is at her left side again.",
        ),
        K(
          L0,
          TP({ x: 0.42, z: 0, th: -90 }),
          [
            ["L", "R", "prep"],
            ["R", "L", "low"],
          ],
          "She faces you again.",
        ),
        K(L0, F0, two, "Tap: both hands. Done."),
      ],
      tips: [
        "Keep BOTH hands the whole time.",
        "Your right hand does not chase her. It stays low and almost still, and she turns into it.",
        "She ends a little to your right, right hip to right hip. That is what leaves room for your arm.",
        "Behind her back means waist height.",
        "To unwind, lift your left hand again: she turns back to her left.",
      ],
      errors: [
        "Pulling her arm up behind her back (shown).",
        "Reaching around her with your right hand instead of letting her turn into it.",
        "Letting go of the low hand, so there’s no hammerlock.",
        "Lifting the low hand too, so she can’t turn into it.",
      ],
      mistake: {
        swapAt: {
          8: { hipBackR: "hipBackRHigh" },
          9: { hipBackR: "hipBackRHigh" },
          10: { hipBackR: "hipBackRHigh" },
          11: { hipBackR: "hipBackRHigh" },
        },
        what: "Her arm is pulled up high behind her back. That hurts her shoulder.",
        fix: "Keep her hand at waist height, relaxed.",
      },
    } as Move;
  })(),
];

export const nearTh = (th, ref) => ref + (((((th - ref + 180) % 360) + 360) % 360) - 180);
// Chain sections into one sequence. Each section is written as if the leader starts at home (L0, facing +x).
// It is then turned and shifted so that it starts exactly where the leader ended the section before.
export const HOME = K(L0, F0, two, "");
export const rotP = (x, z, d) => {
  const c = Math.cos(d * R),
    s = Math.sin(d * R);
  return [x * c + z * s, -x * s + z * c];
};
export function chainKeys(parts: Section[] | Move[]): Key[] {
  const keys = [];
  let Lw = null,
    Fw = null;
  for (const p of parts) {
    const st = p.start || HOME;
    let d = 0,
      T = [0, 0],
      fo = 0;
    if (Lw) {
      d = Lw.th - st.l.th;
      const r = rotP(st.l.x, st.l.z, d);
      T = [Lw.x - r[0], Lw.z - r[1]];
      fo = d + 360 * Math.round((Fw.th - st.f.th - d) / 360);
    }
    const tr = (o, off) => {
      const r = rotP(o.x, o.z, d);
      return { ...o, x: r[0] + T[0], z: r[1] + T[1], th: o.th + off };
    };
    let ax = 90;
    p.keys.forEach((k, i) => {
      if (k.l.mode === "basic") ax = k.l.th;
      const a = k.ax != null ? k.ax : k.l.mode === "basic" ? null : ax;
      keys.push({
        l: tr(k.l, d),
        f: tr(k.f, fo),
        h: k.h,
        cue: k.cue,
        ax: a == null ? undefined : a + d,
        seg: (p as Section).seg || p.name,
        segStart: i === 0,
      });
    });
    const e = keys[keys.length - 1];
    Lw = e.l;
    Fw = e.f;
  }
  return keys;
}
export function combo(name: string, about: string, parts: string[]) {
  const keys = chainKeys(parts.map((p) => moves.find((x) => x.name === p)));
  moves.push({
    name,
    about,
    keys,
    combo: true,
    parts,
    tips: [
      "Every move ends in open hold, facing each other, so the next one can start cleanly.",
      "Decide the next move on count 3, prep on the tap.",
      "If you lose it, do a basic and start again on the next 1.",
    ],
    errors: [
      "Rushing into the next move before finishing the tap.",
      "Thinking so hard about the next move that you stop looking at her.",
    ],
  });
}
// ---- The course combination (Demetrio & Nicole, Bachata Dance Academy), read from the video count by count.
// It is one long sequence of 8-count sections. Each section is written as if you start at home, facing +x,
// and chainKeys() places it where the section before ended. Sections that don't end where they began have a `start`.
export const SEG = (() => {
  const FP = { ...F0, fw: "place" },
    LPl = { ...L0, fw: "place" };
  const X = (o) => ({ ...T(o), cross: 1 });
  const S: Record<string, Section> = {};
  S.basic = { seg: "Basic", keys: B.map((c) => K(L0, F0, two, c)) };
  S.cbl = {
    seg: "Cross-body lead",
    keys: [
      K(
        T({ x: -0.44, z: -0.17, th: 90 }),
        FP,
        two,
        "Step left, a bit bigger than in the basic. She does her basic on the spot.",
      ),
      K(
        X({ x: -0.42, z: -0.38, th: 90 }),
        FP,
        two,
        "Cross your right foot over. Your hands stay where they were, in front of her.",
      ),
      K(T({ x: -0.42, z: -0.58, th: 88 }), FP, two, "Step left again. You’re out of her lane."),
      K(T({ x: -0.42, z: -0.58, th: 86 }), FP, two, "Tap right. Her path is open on your right side."),
      K(
        T({ x: -0.12, z: -0.64, th: 80 }),
        T({ x: 0.18, z: 0.02, th: -100 }),
        two,
        "Step forward on your right, along your own lane, and bring her forward along hers.",
      ),
      K(
        T({ x: 0.24, z: -0.62, th: 10 }),
        T({ x: -0.14, z: -0.02, th: -150 }),
        two,
        "Second step. You pass right shoulder to right shoulder and both start turning right.",
      ),
      K(
        T({ x: 0.42, z: -0.46, th: -30 }),
        T({ x: -0.4, z: -0.2, th: -240 }),
        two,
        "Third step: you’re at her end now, she’s at yours. Keep turning to face her.",
      ),
      K(
        T({ x: 0.43, z: -0.3, th: -90 }),
        T({ x: -0.43, z: -0.3, th: -270 }),
        two,
        "Tap left. You’ve swapped places and face each other again.",
      ),
    ],
  };
  S.lturn = {
    seg: "Left turn",
    keys: [
      K(L0, F0, two, "Basic. Relax your left hand: slide down to a fingertip hold."),
      K(L0, F0, two, "Close. Turn your left hand so your fingers point the way she will turn."),
      K(
        L0,
        F0,
        [
          ["L", "R", "prep"],
          ["R", "L", "low"],
        ],
        "Step, and your left hand comes up. Your right hand stays low, still connected.",
      ),
      K(
        L0,
        F0,
        [
          ["L", "R", "high"],
          ["R", "L", "low"],
        ],
        "Tap: left hand high between you. That’s the signal.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.36, z: 0, th: 5 }),
        [["L", "R", "halo"]],
        "Let go with your right hand. Turn her to her left under your left hand.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.36, z: 0, th: 185 }),
        [["L", "R", "halo"]],
        "Draw a circle above her head. Keep doing your own basic.",
      ),
      K(
        { x: -0.3, z: 0, th: 90 },
        TP({ x: 0.38, z: 0, th: 270 }),
        [["L", "R", "prep"]],
        "She faces you again. The hand comes down.",
      ),
      K(L0, { ...F0, th: 270 }, [["L", "R", "low"]], "Tap: hand at belt level. Don’t take her other hand."),
    ],
  };
  const HK1 = [
      ["R", "R", "back"],
      ["L", "L", "frontL"],
    ],
    LH = (x, z, th) => T({ x: -0.5 + x, z: -0.52 + z, th });
  S.hturn = {
    seg: "Your turn into hammerlock",
    start: K(
      L0,
      F0,
      [["L", "R", "low"]],
      "Open position. Your left hand holds her right hand at belt level, your right hand is free.",
    ),
    keys: [
      K(
        T({ x: -0.44, z: -0.16, th: 180 }),
        FP,
        [["L", "R", "waistNear"]],
        "Step left and turn to your LEFT. Keep her hand at your waist.",
      ),
      K(
        T({ x: -0.46, z: -0.32, th: 270 }),
        FP,
        [["L", "R", "waistNear"]],
        "Second step: your back is to her. Her hand slides around your waist.",
      ),
      K(
        T({ x: -0.5, z: -0.52, th: 360 }),
        FP,
        [[null, "R", "waistNear"]],
        "A bigger third step, still travelling left. Let go and keep turning.",
      ),
      K(
        T({ x: -0.5, z: -0.52, th: 450 }),
        FP,
        [["R", "R", "low"]],
        "Tap, facing her. Take her right hand with your RIGHT hand, like a handshake.",
      ),
      K(
        LH(0.03, -0.06, 430),
        T({ x: 0.1, z: 0.04, th: -75 }),
        [["R", "R", "low"]],
        "Step on the spot. Pull her forward and down, toward your right side.",
      ),
      K(
        LH(0, -0.06, 400),
        T({ x: -0.3, z: 0.08, th: 0 }),
        [["R", "R", "low"]],
        "She walks past your right side and turns to her left. Keep the hand low.",
      ),
      K(
        LH(-0.03, -0.02, 370),
        T({ x: -0.7, z: 0.04, th: 80 }),
        [["R", "R", "back"]],
        "Third step. Her right hand slides behind her back, at waist height.",
      ),
      K(
        LH(-0.03, 0.02, 360),
        T({ x: -0.85, z: 0, th: 90 }),
        HK1,
        "Tap. She has passed you and turned around. Take her left hand in front of her.",
      ),
    ],
  };
  const LB = { x: -0.46, z: -0.32, th: 90, fw: "place" },
    FB = { x: 0.22, z: -0.22, th: -90, fw: "place" },
    HK2 = [
      ["R", "R", "low"],
      ["L", "L", "sideBackR"],
    ];
  S.back = {
    seg: "Hammerlock exit",
    start: K(
      LH(-0.03, 0.02, 0),
      T({ x: -0.85, z: 0, th: 90 }),
      HK1,
      "Hammerlock: she is just past your right side with her right hand behind her back. Left hands are joined in front of her.",
    ),
    keys: [
      K(
        LH(0, -0.04, 20),
        T({ x: -0.6, z: 0.04, th: 65 }),
        HK1,
        "Send her back the way she came. She steps forward and starts turning to her right.",
      ),
      K(
        LH(0.02, -0.04, 50),
        T({ x: -0.3, z: 0.02, th: 0 }),
        [
          ["R", "R", "low"],
          ["L", "L", "side"],
        ],
        "Your left hand guides her left side around. Her right hand comes out from behind her back.",
      ),
      K(
        LH(0.04, 0.14, 80),
        T({ x: 0.18, z: -0.14, th: -70 }),
        HK2,
        "Step in front of her. Now her LEFT hand goes behind her back.",
      ),
      K(
        LH(0.04, 0.2, 90),
        T({ x: 0.22, z: -0.22, th: -90 }),
        HK2,
        "Tap. You face each other, close. One hand behind her back, one in front.",
      ),
      K(LB, FB, HK2, "Basic together, small steps. Keep the hand behind her back low and relaxed."),
      K(LB, FB, HK2, "Close."),
      K(LB, FB, HK2, "Step."),
      K(LB, FB, HK2, "Tap. Get ready to lift your right hand."),
    ],
  };
  const FC = { x: 0.26, z: 0.1, th: -90, fw: "place" },
    HS = [null, "R", "ownShR"];
  S.loopturn = {
    seg: "Her loop and turn",
    start: K(
      LPl,
      FC,
      HK2,
      "Close, facing each other. Her left hand is behind her back in your left hand. Right hands joined in front.",
    ),
    keys: [
      K(
        LPl,
        FC,
        [
          ["R", "R", "high"],
          ["L", "L", "sideBackR"],
        ],
        "Lift your right hand straight up the middle, between you. It’s a loop, not a turn.",
      ),
      K(
        LPl,
        FC,
        [
          ["R", "R", "crown"],
          ["L", "L", "sideBackR"],
        ],
        "Take it over her head. Soft hand, she lets her elbow open.",
      ),
      K(
        LPl,
        FC,
        [["R", null, "besideL"], HS, ["L", "L", "sideBackR"]],
        "Let go as your hand comes down past her left ear. Her hand stays by her shoulder.",
      ),
      K(
        LPl,
        FC,
        [["R", null, "shoulderL"], HS, ["L", "L", "sideBackR"]],
        "Tap. Your right hand rests on the front of her left shoulder.",
      ),
      K(
        L0,
        TP({ x: 0.26, z: 0.1, th: -40 }),
        [["R", null, "shoulderL"], ["L", "L", "sideR"], HS],
        "Push the shoulder gently, pull your left hand: she turns to her left. Basic to your right.",
      ),
      K(
        L0,
        TP({ x: 0.28, z: 0.1, th: 60 }),
        [["R", null, "bladeL"], ["L", "L", "low"], HS],
        "As her back comes round, put your right hand on her left shoulder blade.",
      ),
      K(
        L0,
        TP({ x: 0.28, z: 0.1, th: 170 }),
        [["R", null, "bladeL"], ["L", "L", "low"], HS],
        "Third step. Wait until she is almost round before you move her arm.",
      ),
      K(
        L0,
        TP({ x: 0.28, z: 0.1, th: 245 }),
        [
          ["R", null, "bladeL"],
          ["L", "L", "high"],
          [null, "R", "leadShL"],
        ],
        "Tap. She is almost round. Lift your left hand, with her hand in it.",
      ),
    ],
  };
  const FQ = { x: 0.2, z: 0.1, th: 270, fw: "place" },
    HC = [
      [null, "L", "leadNape"],
      ["L", "R", "closed"],
      ["R", null, "bladeL"],
    ];
  S.hisloop = {
    seg: "Your loop and cross-body lead",
    start: K(
      L0,
      TP({ x: 0.28, z: 0.1, th: 245 }),
      [
        ["R", null, "bladeL"],
        ["L", "L", "high"],
        [null, "R", "leadShL"],
      ],
      "She has almost finished her turn. Your right hand is on her shoulder blade, left hands joined and rising.",
    ),
    keys: [
      K(
        T({ x: -0.42, z: -0.12, th: 90 }),
        TP({ x: 0.26, z: 0.1, th: 265 }),
        [
          ["L", "L", "haloLead"],
          ["R", null, "bladeL"],
          [null, "R", "leadShL"],
        ],
        "Step left. Lift your elbow and take your left hand over YOUR head, her hand with it.",
      ),
      K(
        X({ x: -0.42, z: -0.24, th: 90 }),
        TP({ x: 0.2, z: 0.1, th: 270 }),
        HC,
        "Cross over. Leave her hand behind your neck, then take her right hand with your left.",
      ),
      K(T({ x: -0.42, z: -0.48, th: 88 }), FQ, HC, "A bigger step left. You’re in a closed hold and out of her lane."),
      K(T({ x: -0.42, z: -0.48, th: 86 }), FQ, HC, "Tap."),
      K(
        T({ x: -0.16, z: -0.58, th: 80 }),
        T({ x: 0.1, z: 0.08, th: 250 }),
        HC,
        "Step forward on your right and bring her through on your right side.",
      ),
      K(
        T({ x: 0.14, z: -0.62, th: 10 }),
        T({ x: -0.12, z: 0, th: 200 }),
        HC,
        "Turn to your right together. Stay close.",
      ),
      K(T({ x: 0.3, z: -0.46, th: -30 }), T({ x: -0.4, z: -0.2, th: 120 }), HC, "Third step: you’ve swapped places."),
      K(
        T({ x: 0.3, z: -0.34, th: -90 }),
        T({ x: -0.44, z: -0.48, th: 90 }),
        HC,
        "Tap. Closed hold, facing each other.",
      ),
    ],
  };
  const FZ = { x: 0.24, z: 0.14, th: -90 };
  S.closed = {
    seg: "Basic in closed hold",
    start: K(L0, FZ, HC, "Closed hold."),
    keys: [
      "Basic in the closed hold. Step left.",
      "Close.",
      "Step.",
      "Tap.",
      "Step right.",
      "Close.",
      "Step.",
      "Tap. That’s the whole combination.",
    ].map((c) => K(L0, FZ, HC, c)),
  };
  return S;
})();
{
  const add = (
    name: string,
    about: string,
    parts: Section[],
    tips: string[],
    errors: string[],
    extra: Partial<Move> = {},
  ) =>
    moves.push({
      name,
      about,
      keys: parts.length > 1 ? chainKeys(parts) : parts[0].keys,
      start: parts[0].start,
      tips,
      errors,
      ...extra,
    });
  add(
    "Cross-body lead (course)",
    "You swap places with her. You step out of her lane on 1-2-3-4 and bring her through on 5-6-7-8. Both hands stay connected. 8 counts there, 8 counts back.",
    [SEG.cbl, SEG.cbl],
    [
      "Counts 1 to 4 are only for you: you get out of her way while she does a small basic.",
      "Keep your hands where they were, in front of her. If your hands travel with you, she follows you and the lane closes.",
      "On 5-6-7 you walk around to where she was, and she walks straight to where you were.",
      "Think “we switch places.” Don’t overthink the feet.",
    ],
    [
      "Taking your hands with you when you step aside, so she follows you.",
      "Pulling her through with your arms instead of walking.",
      "Standing still on 5-6-7 instead of taking your three steps.",
      "Stepping on her toes: make your side steps clear enough to leave her lane.",
    ],
  );
  add(
    "Left turn with prep (course)",
    "Her left turn under your left hand, the way the course builds it: the hand rises on 3 and 4, she turns on 5-6-7, and you finish with one hand at belt level.",
    [SEG.lturn],
    [
      "Before the hand goes up, relax it: slide to a fingertip hold and turn your hand so the fingers point where she will turn.",
      "Hand up on 3-4, turn on 5-6-7.",
      "Draw a circle around her with your hand. Don’t stand back and wait for her to turn by herself.",
      "On 7-8 the hand comes down to belt level and you do NOT take her other hand.",
    ],
    [
      "Lifting the hand with a tight grip, so she can’t rotate inside it.",
      "Staying far back with a stretched arm.",
      "Taking her other hand at the end. The next move needs it free.",
    ],
  );
  add(
    "Your turn into hammerlock (course)",
    "You turn to your left on 1-2-3-4 and change to a handshake hold. On 5-6-7-8 you pull her forward past your right side into a hammerlock. Starts with your left hand holding her right.",
    [SEG.hturn],
    [
      "Every step of your turn travels to your left. Don’t come back to where you started.",
      "Keep her hand at your waist while you turn. When you let go on 3, your other hand is already there to take it.",
      "Step 3 is a little bigger. It leaves a lane on your right side for her.",
      "On 5 pull forward at an angle and DOWN, early, so her arm ends behind her back without bending upward.",
      "Do a basic on the spot on 5-6-7. Don’t just stand there.",
    ],
    [
      "Lifting her hand to shoulder height in the hammerlock. That twists her arm.",
      "Stepping back toward her at the end of your turn, so she has no lane.",
      "Gripping. The hands must be able to slide and rotate against each other.",
      "Standing still while she walks.",
    ],
  );
  add(
    "Hammerlock exit (course)",
    "From the hammerlock at your right side you send her back the way she came. She turns to her right, and the arms switch: now her left hand is behind her back. Then a basic together.",
    [SEG.back],
    [
      "Push her left side forward and around with your left hand. It’s a push and a turn at once.",
      "As she turns, the hand that was in front slides behind her back and the other comes out.",
      "Step in front of her on 3 and 4.",
      "Her joints are sensitive in this hold. Go slowly and keep the hands low.",
    ],
    [
      "Pulling the arm that is behind her back.",
      "Staying beside her instead of stepping in front.",
      "Holding the hands so tight that they can’t change places.",
    ],
  );
  add(
    "Her loop and turn (course)",
    "A loop: your right hand lifts her right hand straight over her own head and lets it go. Then you turn her to her left with a push on the shoulder. Starts from the close hold with her left hand behind her back.",
    [SEG.loopturn],
    [
      "A loop goes straight up the middle and over her head. A turn starts from the side. That’s how she tells them apart.",
      "Let go by 3, hand on the front of her left shoulder by 4.",
      "To turn her: push the shoulder with your right hand, pull with your left. Gently. She should still be able to do her basic.",
      "By 6 your right hand is on her left shoulder blade.",
      "Straighten her arm first and wait until she has almost come round before you move it further.",
    ],
    [
      "Pushing her backward instead of turning her. If she falls back, push less and pull more.",
      "Sweeping the loop across her face.",
      "Yanking the arm that was behind her back.",
    ],
  );
  add(
    "Your loop to closed hold (course)",
    "You take your own left hand over your head, so her hand lands behind your neck: a closed hold. Meanwhile you step out of her lane, then bring her through on your right side. Ends with a basic in closed hold.",
    [SEG.hisloop, SEG.closed],
    [
      "Lift your elbow to make a tunnel and put your own head through it.",
      "While you loop on 1-2-3 you are already stepping left, out of her way. Step 3 is the bigger one.",
      "Then it’s the same cross-body lead as at the start, just in a closed hold.",
      "Small steps. In a closed hold her feet are right next to yours.",
    ],
    [
      "Forgetting to step aside while you loop, so there’s no room to bring her through.",
      "Dropping her hand on your head instead of behind your neck.",
      "Stepping on her toes.",
    ],
  );
}
combo("Combo 1: Turns", "Basic, inside turn, basic, outside turn. 32 counts. Your first full sequence.", [
  "Side basic",
  "Inside turn",
  "Side basic",
  "Outside turn",
]);
combo("Combo 2: Wrap", "Basic, wrap in and out, then an inside turn. 32 counts.", [
  "Side basic",
  "Wrap",
  "Inside turn",
]);
combo(
  "Combo 3: Full dance",
  "Inside turn, hammerlock, your turn, place swap, wrap. 64 counts with no plain basics in between.",
  ["Inside turn", "Hammerlock", "Your turn", "Place swap", "Wrap"],
);
moves.push({
  name: "Course combination",
  about:
    "The whole sequence from the Demetrio & Nicole course, in order: basic, cross-body lead, her left turn, your turn into the hammerlock, the exit, her loop and turn, your loop, and a cross-body lead in closed hold. 64 counts.",
  keys: chainKeys([SEG.basic, SEG.cbl, SEG.lturn, SEG.hturn, SEG.back, SEG.loopturn, SEG.hisloop, SEG.closed]),
  combo: true,
  start: K(L0, F0, two, "Open position, both hands. You start with one basic."),
  parts: [
    "Basic",
    "Cross-body lead",
    "Left turn",
    "Your turn into hammerlock",
    "Hammerlock exit",
    "Her loop and turn",
    "Your loop and cross-body lead",
    "Basic in closed hold",
  ],
  tips: [
    "Learn it one section at a time: each section is also in the list under “From the course.”",
    "There is no basic between the sections. While you finish one, you are already preparing the next.",
    "In class you would put a basic between the moves. Do that whenever you need time to think.",
    "If she is new to this too, go slowly and let each other make mistakes.",
  ],
  errors: [
    "After your own turn, going back into a basic instead of stepping out of her way.",
    "Taking her free hand after her left turn. You need it free for your turn.",
    "Rushing the hammerlock. Keep those hands low and gentle.",
  ],
});
