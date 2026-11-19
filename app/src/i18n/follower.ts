// The follower's side of every text. The library and the page are written for the leader ("lift your left
// hand, she turns"); this file gives the same moment in her words ("turn to your left under your right hand").
//
//   follower       leader's text -> her text. Used for cues, descriptions, mistakes, names and page texts.
//                  A text that is not listed reads the same for both.
//   followerNotes  per move: her own "do this" and "common mistakes" lists.
//
// Written by the AI from the choreography, not by a teacher. tests/i18n.test.ts checks that every count of
// every move has an entry here.

const same = (...texts: string[]) => Object.fromEntries(texts.map((t) => [t, t]));
const KEEP_TURNING = "Keep turning. Your back is to him for a moment. Small steps, feet under you.";

export const follower: Record<string, string> = {
  // ---------------------------------------------------------------- page
  "Partner moves from the leader’s side, count by count": "Partner moves from the follower’s side, count by count",
  "<b>You</b>, the leader": "<b>Him</b>, the leader",
  "<b>Her</b>, the follower": "<b>You</b>, the follower",
  "<b>Gold arrow:</b> where your left hand goes next": "<b>Gold arrow:</b> where your right hand goes next",
  "Two figures dance each move slowly, one count at a time. You are the green one.":
    "Two figures dance each move slowly, one count at a time. You are the pink one.",
  "If the colors are the wrong way round (you should be green), press “Swap colors.”":
    "If the colors are the wrong way round (you should be pink), press “Swap colors.”",

  // ---------------------------------------------------------------- names
  "Your turn": "His turn",
  "Your turn into hammerlock": "His turn into hammerlock",
  "Her loop and turn": "Your loop and turn",
  "Your loop to closed hold": "His loop to closed hold",
  "Your loop and cross-body lead": "His loop and cross-body lead",

  // ---------------------------------------------------------------- texts that read the same for both
  ...same(
    "Close.",
    "Step.",
    "Tap.",
    "Basic.",
    "Basic. Eyes up.",
    "Basic, both hands.",
    "Tap: both hands. Basic.",
    "Tap: both hands back.",
    "Tap: both hands. Done.",
    "Tap: you’re in the wrap. Arms relaxed.",
    "Tap: open position again.",
    "Facing each other again, on swapped sides.",
    "Home again, facing each other.",
    "Basic in the hammerlock, small steps, close and relaxed.",
    "Second step. You pass right shoulder to right shoulder and both start turning right.",
    "Third step: you’ve swapped places.",
    "Tap. Closed hold, facing each other.",
    "Tap. That’s the whole combination.",
    "Open position, both hands. You start with one basic.",
    "The same rhythm without traveling: 3 small steps and a tap, on the spot. Good for tight dance floors and for slow songs.",
    "Basic, inside turn, basic, outside turn. 32 counts. Your first full sequence.",
    "Basic, wrap in and out, then an inside turn. 32 counts.",
  ),

  // ---------------------------------------------------------------- side basic (she mirrors: right first)
  "The base of everything: 3 steps and a tap to your left, then to your right. Learn this first.":
    "The base of everything: 3 steps and a tap to your right, then to your left. Learn this first.",
  "Step to your left. Knees soft.": "Step to your right. Knees soft.",
  "Close the right foot.": "Close the left foot.",
  "Step left again.": "Step right again.",
  "Tap right: no weight, hip pops.": "Tap left: no weight, hip pops.",
  "Step to your right.": "Step to your left.",
  "Close the left foot.": "Close the right foot.",
  "Step right again.": "Step left again.",
  "Tap left: no weight.": "Tap right: no weight.",
  "Locked knees, giant steps, eyes on the floor.":
    "He is the one doing it here, but it is the same mistake for you: locked knees, giant steps, eyes on the floor.",
  "Soft knees, small steps, eyes on her.": "Soft knees, small steps, eyes on him.",

  // ---------------------------------------------------------------- basic in place
  "Step left, on the spot.": "Step right, on the spot.",
  "Step right.": "Step left.",
  "Step left.": "Step right.",

  // ---------------------------------------------------------------- forward & back
  "3 steps forward and a tap, then 3 steps back and a tap. She mirrors you: when you go forward, she goes back.":
    "3 steps back and a tap, then 3 steps forward and a tap. You mirror him: when he comes forward, you go back.",
  "Step forward on your left. She steps back.": "Step back on your right. He comes forward.",
  "Step forward right.": "Step back left.",
  "Step forward left.": "Step back right.",
  "Tap right beside your left foot.": "Tap left beside your right foot.",
  "Step back on your right. She comes forward.": "Step forward on your left. He steps back.",
  "Step back left.": "Step forward right.",
  "Step back right.": "Step forward left.",
  "Tap left.": "Tap right.",

  // ---------------------------------------------------------------- inside turn
  "She turns to her left under your left hand. Prep on 4, turn on 5-6-7.":
    "You turn to your left under your right hand. He preps on 4, you turn on 5-6-7.",
  "Basic. Eyes on her, not your feet.": "Basic. Eyes on him, not your feet.",
  "Step. Decide now.": "Step. Just dance: don’t guess what comes next.",
  "Tap + prep: bring your left hand up near her LEFT ear. Your right hand stays low, still holding hers.":
    "Tap. He lifts your right hand near your LEFT ear: that is the prep. A turn to your left is coming.",
  "Let go with your right hand. Left hand goes up over HER head. She turns to her left.":
    "He lets go of your left hand. Step and start turning to your LEFT under your right hand.",
  "Small circle right above her head.": KEEP_TURNING,
  "Hand comes down as she faces you again.": "Finish the turn facing him. Your hand comes down.",
  "Tap: catch both hands. Back to basic.": "Tap: give him both hands. Back to basic.",
  "Too far apart, arm stretched at shoulder height. She has to duck under your arm.":
    "He is too far away with a stretched arm, so you would have to duck under it.",
  "Step in. Hand up and over HER head, elbow soft.":
    "Don’t fix it for him by ducking or rushing. Stay tall, take small steps, and turn under your own hand.",

  // ---------------------------------------------------------------- outside turn
  "Same as the inside turn, but she turns to her right. Learn it after the inside turn.":
    "Same as the inside turn, but you turn to your right. Learn it after the inside turn.",
  "Tap + prep: let go right. Bring your left hand up near her RIGHT ear.":
    "Tap. He lets go of your left hand and lifts your right hand near your RIGHT ear. A turn to your right is coming.",
  "Hand up over her head. She turns to her right.": "Step and start turning to your RIGHT under your right hand.",
  "Small clockwise circle above her head.": KEEP_TURNING,
  "Hand comes down as she faces you.": "Finish the turn facing him. Your hand comes down.",
  "A big stirring circle instead of a small halo. It pulls her off balance.":
    "He stirs a big circle instead of a small halo. It pulls you off balance.",
  "Keep the circle small, right above her head.":
    "Keep your own axis: feet under you, small steps, arm relaxed so the circle doesn’t drag your shoulder.",

  // ---------------------------------------------------------------- his turn
  "You turn to your right under your joined hands while she keeps dancing.":
    "He turns to his right under your joined hands while you keep dancing your basic.",
  "Tap + prep: let go right, lift left.": "Tap. He lets go of your left hand and lifts your right.",
  "Hand above YOUR head. Turn right, eyes stay on her.":
    "He turns under your joined hands. Keep your basic and let your hand follow his.",
  "Whip your head around. Find her face first.": "His back passes in front of you. Hand loose: don’t hold him back.",
  "Body catches up with your eyes. Facing her.": "He comes round to face you. Your hand comes down.",
  "No spotting: your head turns with your body, so you get dizzy and lose her.":
    "He doesn’t spot: his head turns with his body, so he loses sight of you.",
  "Eyes stay on her, then the head whips around before the body.":
    "Nothing to fix on your side. Keep your basic steady, so he finds you where he left you.",

  // ---------------------------------------------------------------- place swap
  "Cross-body lead: you step out of her way and she walks across to your side. 8 counts there, 8 counts back.":
    "Cross-body lead: he steps out of your way and you walk across to his side. 8 counts there, 8 counts back.",
  "Step back on your left and start turning left. You open the door.":
    "Step forward. He steps back out of your way: the door opens.",
  "Keep turning: you're now beside her path. Guide her forward.": "Walk straight ahead. Don’t curve toward him.",
  "She walks straight past, in front of you.": "Third step, straight past him.",
  "Tap. She's crossing to the other side.": "Tap. You are almost on the other side.",
  "Turn to follow her. She starts her half turn to the left.": "Step and start a half turn to your left.",
  "She keeps turning to face you.": "Keep turning to face him.",
  "Tap + prep: get ready to go back.": "Tap. The same thing is coming again, back the other way.",
  "Same way back: step back on your left, turn left.": "Same way back: step forward as he opens your path.",
  "Keep turning, open her path.": "Walk straight ahead again.",
  "Tap. She's crossing.": "Tap. You are crossing.",
  "Turn to follow her. She starts her half turn.": "Step and start your half turn to the left.",
  "Tap + prep: ready to go again.": "Tap. Ready to go again.",
  "Stiff legs and big steps. You stop dancing and just walk.":
    "Stiff legs and big steps: the dancing stops and it becomes walking. He shows it here, but it happens to followers too.",
  "Keep small bachata steps and soft knees while you pass.": "Keep small bachata steps and soft knees while you cross.",

  // ---------------------------------------------------------------- wrap
  "You turn her into your right arm. She ends at your right side with your arm around her back and her own arms crossed in front. Then you unwrap her. 16 counts.":
    "He turns you into his right arm. You end at his right side with his arm around your back and your own arms crossed in front. Then he unwraps you. 16 counts.",
  "Tap + prep: keep both hands. Lift your left hand.": "Tap. He keeps both your hands and lifts your right one.",
  "Left hand over her head. She turns left, toward your right side.":
    "Turn to your left under your right hand, toward his right side. Keep both hands.",
  "Hand comes down in FRONT of her, a forearm away from her face, then to her chest. Never across her face.":
    "Keep turning. Your right hand comes down in front of you, and your left arm wraps across your waist.",
  "She lands at your right side, facing the same way. Your right arm is now around her back.":
    "You arrive at his right side, facing the same way as him. His arm is around your back, your arms are crossed in front.",
  "Basic together in the wrap. Your right hand holds her left hand at her far hip.":
    "Basic together in the wrap, side by side. Your left hand rests in his at your right hip.",
  "Tap + prep: lift your left hand first, out in front of her.":
    "Tap. He lifts your right hand in front of you: that is the way out.",
  "Hand goes up. She unwinds to her right.": "Unwind to your right under your right hand.",
  "Right hand stays low and soft. It’s her anchor.": "Keep turning. Your left hand stays low in his.",
  "She lands back in front of you.": "You arrive back in front of him.",
  "Your hand comes down across her face on 6.": "His hand comes down across your face on 6.",
  "Up over her head, then down in FRONT of her chest.":
    "Stay tall and tell him. The hand should pass over your head, then down in front of your chest.",

  // ---------------------------------------------------------------- hammerlock
  "She turns to her right with BOTH hands kept. Your right hand stays low, so her left arm folds behind her back and her left hand ends at her right hip. She finishes at your right side, facing you. Then she unwinds. 16 counts.":
    "You turn to your right keeping BOTH hands. His right hand stays low, so your left arm folds behind your back and your left hand ends at your right hip. You finish at his right side, facing him. Then you unwind. 16 counts.",
  "Tap + prep: keep BOTH hands. Left hand up near her right ear, right hand stays low.":
    "Tap. He keeps BOTH your hands. Your right hand goes up near your right ear, your left stays low.",
  "Left hand over her head: she turns to her RIGHT. Your right hand stays low, at her left side.":
    "Turn to your RIGHT under your right hand. Leave your left hand low in his.",
  "Don’t move your right hand: she turns into it. Her left arm folds behind her back.":
    "Keep turning. Let your left arm fold behind your back, at waist height. Don’t pull it free.",
  "She faces you again, a little to your right. Her left hand is at her right hip, behind her back.":
    "You face him again, a little to his right. Your left hand is behind your back, at your right hip.",
  "Tap: you’re in the hammerlock. Right hip to right hip, left hands low in front.":
    "Tap: you’re in the hammerlock. Right hip to right hip, shoulders relaxed.",
  "Tap + prep: lift your left hand near her left ear to unwind.":
    "Tap. He lifts your right hand near your left ear: you are going to unwind.",
  "She unwinds to her LEFT under your left hand. Your right hand still stays low.":
    "Unwind to your LEFT under your right hand. Your left hand stays low.",
  "Her arm unfolds: your right hand is at her left side again.": "Your left arm unfolds from behind your back.",
  "She faces you again.": "You face him again.",
  "Her arm is pulled up high behind her back. That hurts her shoulder.":
    "Your arm is pulled up high behind your back. That hurts your shoulder.",
  "Keep her hand at waist height, relaxed.":
    "Say so right away. Your hand belongs at waist height, relaxed, and you can let go at any time.",

  // ---------------------------------------------------------------- cross-body lead (course)
  "You swap places with her. You step out of her lane on 1-2-3-4 and bring her through on 5-6-7-8. Both hands stay connected. 8 counts there, 8 counts back.":
    "You swap places with him. He steps out of your lane on 1-2-3-4 and brings you through on 5-6-7-8. Both hands stay connected. 8 counts there, 8 counts back.",
  "Step left, a bit bigger than in the basic. She does her basic on the spot.":
    "Basic on the spot. He steps aside, out of your lane. Don’t follow him.",
  "Cross your right foot over. Your hands stay where they were, in front of her.":
    "Second step on the spot. Your hands stay in front of you.",
  "Step left again. You’re out of her lane.": "Third step on the spot. Your lane is clear now.",
  "Tap right. Her path is open on your right side.": "Tap. Wait for him to bring you forward.",
  "Step forward on your right, along your own lane, and bring her forward along hers.":
    "Walk forward, straight along your lane.",
  "Third step: you’re at her end now, she’s at yours. Keep turning to face her.":
    "Third step: you’re at his end now. Keep turning to face him.",
  "Tap left. You’ve swapped places and face each other again.": "Tap. You’ve swapped places and face each other again.",

  // ---------------------------------------------------------------- left turn with prep (course)
  "Her left turn under your left hand, the way the course builds it: the hand rises on 3 and 4, she turns on 5-6-7, and you finish with one hand at belt level.":
    "Your left turn under your right hand, the way the course builds it: the hand rises on 3 and 4, you turn on 5-6-7, and you finish with one hand at belt level.",
  "Basic. Relax your left hand: slide down to a fingertip hold.":
    "Basic. His hand loosens into a fingertip hold. Keep your fingers soft too.",
  "Close. Turn your left hand so your fingers point the way she will turn.": "Close. His hand turns in yours. Let it.",
  "Step, and your left hand comes up. Your right hand stays low, still connected.":
    "Step. Your right hand starts to rise. Your left stays low in his.",
  "Tap: left hand high between you. That’s the signal.":
    "Tap: your right hand is high between you. That’s the signal for a turn.",
  "Let go with your right hand. Turn her to her left under your left hand.":
    "He lets go of your left hand. Turn to your left under your right hand.",
  "Draw a circle above her head. Keep doing your own basic.": KEEP_TURNING,
  "She faces you again. The hand comes down.": "You face him again. The hand comes down.",
  "Tap: hand at belt level. Don’t take her other hand.":
    "Tap: hand at belt level. Your left hand stays free. Don’t reach for his.",

  // ---------------------------------------------------------------- his turn into hammerlock (course)
  "You turn to your left on 1-2-3-4 and change to a handshake hold. On 5-6-7-8 you pull her forward past your right side into a hammerlock. Starts with your left hand holding her right.":
    "He turns to his left on 1-2-3-4 and changes to a handshake hold. On 5-6-7-8 he brings you forward past his right side into a hammerlock. Starts with his left hand holding your right.",
  "Open position. Your left hand holds her right hand at belt level, your right hand is free.":
    "Open position. His left hand holds your right hand at belt level. Your left hand is free.",
  "Step left and turn to your LEFT. Keep her hand at your waist.":
    "He starts turning away from you. Basic on the spot. Your hand stays at his waist.",
  "Second step: your back is to her. Her hand slides around your waist.":
    "His back is to you. Let your hand slide around his waist.",
  "A bigger third step, still travelling left. Let go and keep turning.":
    "He lets go for a moment. Leave your hand where it is: he will take it again.",
  "Tap, facing her. Take her right hand with your RIGHT hand, like a handshake.":
    "Tap. He takes your right hand with his right hand, like a handshake.",
  "Step on the spot. Pull her forward and down, toward your right side.":
    "He brings you forward, toward his right side. Walk.",
  "She walks past your right side and turns to her left. Keep the hand low.":
    "Walk past his right side and turn to your left. Your hand stays low.",
  "Third step. Her right hand slides behind her back, at waist height.":
    "Third step. Your right hand slides behind your back, at waist height. Keep the elbow relaxed.",
  "Tap. She has passed you and turned around. Take her left hand in front of her.":
    "Tap. You have passed him and turned around. Give him your left hand in front of you.",

  // ---------------------------------------------------------------- hammerlock exit (course)
  "From the hammerlock at your right side you send her back the way she came. She turns to her right, and the arms switch: now her left hand is behind her back. Then a basic together.":
    "From the hammerlock at his right side he sends you back the way you came. You turn to your right, and the arms switch: now your left hand is behind your back. Then a basic together.",
  "Hammerlock: she is just past your right side with her right hand behind her back. Left hands are joined in front of her.":
    "Hammerlock: you are just past his right side with your right hand behind your back. Left hands are joined in front of you.",
  "Send her back the way she came. She steps forward and starts turning to her right.":
    "He sends you back the way you came. Step forward and start turning to your right.",
  "Your left hand guides her left side around. Her right hand comes out from behind her back.":
    "Keep turning. Your right hand comes out from behind your back.",
  "Step in front of her. Now her LEFT hand goes behind her back.":
    "He steps in front of you. Now your LEFT hand goes behind your back.",
  "Tap. You face each other, close. One hand behind her back, one in front.":
    "Tap. You face each other, close. One hand behind your back, one in front.",
  "Basic together, small steps. Keep the hand behind her back low and relaxed.":
    "Basic together, small steps. Keep the arm behind your back relaxed.",
  "Tap. Get ready to lift your right hand.": "Tap. Your right hand is about to go up.",

  // ---------------------------------------------------------------- your loop and turn (course)
  "A loop: your right hand lifts her right hand straight over her own head and lets it go. Then you turn her to her left with a push on the shoulder. Starts from the close hold with her left hand behind her back.":
    "A loop: his right hand lifts your right hand straight over your own head and lets it go. Then he turns you to your left with a push on the shoulder. Starts from the close hold with your left hand behind your back.",
  "Close, facing each other. Her left hand is behind her back in your left hand. Right hands joined in front.":
    "Close, facing each other. Your left hand is behind your back in his left hand. Right hands joined in front.",
  "Lift your right hand straight up the middle, between you. It’s a loop, not a turn.":
    "Your right hand goes straight up the middle, between you. It’s a loop: keep your basic, don’t turn.",
  "Take it over her head. Soft hand, she lets her elbow open.":
    "Your hand passes over your own head. Let your elbow open.",
  "Let go as your hand comes down past her left ear. Her hand stays by her shoulder.":
    "He lets go as the hand comes down past your left ear. Leave your hand by your shoulder.",
  "Tap. Your right hand rests on the front of her left shoulder.":
    "Tap. His hand rests on the front of your left shoulder.",
  "Push the shoulder gently, pull your left hand: she turns to her left. Basic to your right.":
    "A gentle push on your shoulder: turn to your left. Keep stepping your basic.",
  "As her back comes round, put your right hand on her left shoulder blade.":
    "Keep turning. His hand moves to your left shoulder blade.",
  "Third step. Wait until she is almost round before you move her arm.":
    "Third step. Your left arm straightens out from behind your back.",
  "Tap. She is almost round. Lift your left hand, with her hand in it.":
    "Tap. You are almost round. Your left hand rises in his.",

  // ---------------------------------------------------------------- his loop to closed hold (course)
  "You take your own left hand over your head, so her hand lands behind your neck: a closed hold. Meanwhile you step out of her lane, then bring her through on your right side. Ends with a basic in closed hold.":
    "He takes his own left hand over his head, so your hand lands behind his neck: a closed hold. Meanwhile he steps out of your lane, then brings you through on his right side. Ends with a basic in closed hold.",
  "She has almost finished her turn. Your right hand is on her shoulder blade, left hands joined and rising.":
    "You have almost finished your turn. His right hand is on your shoulder blade, left hands joined and rising.",
  "Step left. Lift your elbow and take your left hand over YOUR head, her hand with it.":
    "Finish your turn. He takes your left hand over HIS head.",
  "Cross over. Leave her hand behind your neck, then take her right hand with your left.":
    "Your left hand lands behind his neck. Leave it there. He takes your right hand.",
  "A bigger step left. You’re in a closed hold and out of her lane.":
    "You’re in a closed hold. He steps out of your lane.",
  "Step forward on your right and bring her through on your right side.": "Walk forward, past his right side.",
  "Turn to your right together. Stay close.": "Turn together. Stay close.",
  "Basic in the closed hold. Step left.": "Basic in the closed hold. Step right.",

  // ---------------------------------------------------------------- combos
  "Inside turn, hammerlock, your turn, place swap, wrap. 64 counts with no plain basics in between.":
    "Inside turn, hammerlock, his turn, place swap, wrap. 64 counts with no plain basics in between.",
  "The whole sequence from the Demetrio & Nicole course, in order: basic, cross-body lead, her left turn, your turn into the hammerlock, the exit, her loop and turn, your loop, and a cross-body lead in closed hold. 64 counts.":
    "The whole sequence from the Demetrio & Nicole course, in order: basic, cross-body lead, your left turn, his turn into the hammerlock, the exit, your loop and turn, his loop, and a cross-body lead in closed hold. 64 counts.",
};

interface Notes {
  tips: string[];
  errors: string[];
}
const TURN_TIPS = [
  "Wait for the prep on 4. No prep, no turn.",
  "Your steps make the turn: three small steps on 5-6-7, feet under your body.",
  "Spot: look at him as long as you can, then find his face again.",
  "Arm relaxed, elbow down, fingers loose inside his hand.",
];
const COMBO: Notes = {
  tips: [
    "You don’t need to know the order. Follow each prep as it comes.",
    "Finish every move completely, tap included, before thinking about the next.",
    "If it falls apart, go back to your basic. He will start again on the next 1.",
  ],
  errors: ["Learning the order by heart and dancing ahead of him.", "Rushing the tap to get to the next move."],
};

export const followerNotes: Record<string, Notes> = {
  "Side basic": {
    tips: [
      "You start to your right, on your right foot: you are his mirror.",
      "Soft knees the whole time. Your hips move because your knees bend.",
      "Tap means no weight. You should be able to lift that foot instantly.",
      "Keep a little tone in your arms, so you feel where he goes.",
    ],
    errors: [
      "Putting weight on the tap, so you start the next 4 on the wrong foot.",
      "Steps bigger than his, which pulls on his hands.",
      "Limp arms: he moves and you only notice a beat later.",
    ],
  },
  "Basic in place": {
    tips: [
      "Same rhythm as the side basic, the feet just stay under you.",
      "Keep changing weight fully on every step.",
      "The hips keep moving even though you don’t travel.",
    ],
    errors: ["Marching with stiff knees.", "Bouncing up and down instead of moving the hips side to side."],
  },
  "Forward & back": {
    tips: [
      "You start going BACK, on your right foot.",
      "Step back with the toes first and keep your weight slightly toward him.",
      "Let his body move you. Keep the same distance between you the whole time.",
    ],
    errors: [
      "Leaning back, away from him.",
      "Stepping before he moves: wait until you feel him come forward.",
      "Looking down at your feet.",
    ],
  },
  "Inside turn": {
    tips: TURN_TIPS,
    errors: [
      "Turning before he leads it, because you saw it coming.",
      "Gripping his hand, so yours can’t rotate inside it.",
      "Big steps in the turn: you drift away and the arm stretches.",
    ],
  },
  "Outside turn": {
    tips: [
      "Same turn as the inside turn, to your right this time.",
      "The prep tells you the direction: hand near your RIGHT ear means a turn to your right.",
      "Three small steps on 5-6-7, feet under your body.",
    ],
    errors: [
      "Guessing the direction instead of feeling the prep.",
      "Throwing yourself into the turn, faster than the music.",
      "Lifting your shoulder with your arm.",
    ],
  },
  "Your turn": {
    tips: [
      "This one is his turn. You keep your basic going, steady.",
      "Let your right hand rise with his and keep it loose, so he can turn inside it.",
      "Stay where you are. He comes back to face you.",
    ],
    errors: [
      "Turning as well, because a hand went up.",
      "Holding his hand tight, which stops his turn.",
      "Stopping your feet while you watch him.",
    ],
  },
  "Place swap": {
    tips: [
      "Walk in a straight line, as if on a rail. He is the one who gets out of the way.",
      "Three steps across on 1-2-3, then your half turn to the left on 5-6-7. It takes all 8 counts.",
      "Keep your steps small and your knees soft: it is still bachata.",
    ],
    errors: [
      "Curving toward him instead of walking straight.",
      "Turning too early, before you have passed him.",
      "Running across in three big strides.",
    ],
  },
  Wrap: {
    tips: [
      "Keep both hands the whole time.",
      "You turn to your left and roll into his right arm, ending at his right side.",
      "Let your arms cross in front of you, relaxed, at waist and chest height.",
      "To get out, you unwind to your right under your right hand.",
    ],
    errors: [
      "Letting go of his low hand while you turn.",
      "Stopping halfway, facing him sideways: finish the turn until you face the same way as him.",
      "Leaning on his arm in the wrap.",
    ],
  },
  Hammerlock: {
    tips: [
      "Keep BOTH hands the whole time.",
      "His low hand does not move: you turn INTO it, and your arm folds behind your back.",
      "Your hand stays at waist height. If it goes higher, say so.",
      "You end a little to his right, right hip to right hip.",
    ],
    errors: [
      "Pulling the low hand free when you feel it go behind you.",
      "Stiffening the arm behind your back. Keep the elbow soft.",
      "Stopping the turn early, so you end in front of him instead of at his right.",
    ],
  },
  "Cross-body lead (course)": {
    tips: [
      "Counts 1 to 4: he gets out of your way. You dance a small basic on the spot.",
      "Don’t follow him when he steps aside. Your hands stay in front of you.",
      "On 5-6-7 you walk straight to where he was, and turn to face him at the end.",
    ],
    errors: [
      "Following him sideways on 1-2-3, which closes your own lane.",
      "Walking before he brings you forward on 5.",
      "Walking around him instead of straight ahead.",
    ],
  },
  "Left turn with prep (course)": {
    tips: [
      "The hand rising on 3 and 4 is the signal. You turn on 5-6-7.",
      "Fingers soft: the hold becomes a fingertip hold, so your hand can rotate.",
      "Keep doing your basic steps while you turn.",
      "At the end your left hand stays free. The next move needs it.",
    ],
    errors: [
      "Turning on 4, as soon as the hand goes up.",
      "Gripping, so your hand can’t rotate inside his.",
      "Reaching for his other hand at the end.",
    ],
  },
  "Your turn into hammerlock (course)": {
    tips: [
      "Counts 1 to 4 are his turn: you do a basic on the spot and your hand slides around his waist.",
      "On 5 he brings you forward and down. Walk past his right side, three steps.",
      "You turn to your left as you pass, and your right hand ends behind your back at waist height.",
      "Keep the arm relaxed. Say so if it is lifted or twisted.",
    ],
    errors: [
      "Travelling with him during his turn instead of staying on your spot.",
      "Resisting the pull on 5, so you arrive late.",
      "Stiffening the arm that goes behind your back.",
    ],
  },
  "Hammerlock exit (course)": {
    tips: [
      "He sends you back the way you came: step forward and turn to your right.",
      "As you turn, the hand that was behind your back comes out and the other one goes behind.",
      "Let the hands slide and rotate. Don’t hold on.",
      "Then a small basic together, close.",
    ],
    errors: [
      "Holding his hands so tight that they can’t change places.",
      "Turning the wrong way: this one goes to your right.",
      "Stepping away from him at the end. You stay close.",
    ],
  },
  "Her loop and turn (course)": {
    tips: [
      "A loop goes straight up the middle and over your head: you do NOT turn. A turn starts from the side.",
      "After the loop he lets go. Leave your hand by your shoulder.",
      "The turn comes from a gentle push on your left shoulder: turn to your left and keep your basic.",
      "The arm behind your back straightens by itself as you come round.",
    ],
    errors: [
      "Turning on the loop.",
      "Falling backward on the shoulder push instead of turning on the spot.",
      "Pulling your arm out from behind your back too early.",
    ],
  },
  "Your loop to closed hold (course)": {
    tips: [
      "He takes your left hand over his own head. Let it land behind his neck and leave it there.",
      "You are now in a closed hold. Small steps: his feet are right next to yours.",
      "On 5-6-7 walk forward past his right side and turn with him.",
      "Then a basic together in the closed hold.",
    ],
    errors: [
      "Taking your hand back when it reaches his neck.",
      "Big steps in the closed hold: you will step on his toes.",
      "Leaning on him. Stand on your own feet.",
    ],
  },
  "Combo 1: Turns": COMBO,
  "Combo 2: Wrap": COMBO,
  "Combo 3: Full dance": COMBO,
  "Course combination": {
    tips: [
      "Learn it one section at a time: each section is also in the list under “From the course.”",
      "There is no basic between the sections, so the next lead comes right at the end of each move.",
      "Several moves put a hand behind your back. Keep that arm relaxed and say so if anything pulls.",
      "If he is new to this too, go slowly and let each other make mistakes.",
    ],
    errors: [
      "Giving him your free hand after your left turn. It has to stay free for his turn.",
      "Dancing the sequence from memory, ahead of his lead.",
      "Tensing up in the hammerlock. Low and relaxed is safe.",
    ],
  },
};
