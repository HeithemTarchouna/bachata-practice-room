// French. Keys are the English texts exactly as written in the page, the interface and the move library.
// The leader is addressed as "tu". Dance words kept as French dancers say them: tap, wrap, hammerlock, POV.
// tests/i18n.test.ts fails when a text of the app has no entry here.
import { frFollower } from "./fr-follower";

export const fr: Record<string, string> = {
  // ---------------------------------------------------------------- page
  "Partner moves from the leader’s side, count by count": "Les figures à deux, vues côté leader, temps par temps",
  Language: "Langue",
  "How it works": "Mode d’emploi",
  "Switch between light and dark": "Passer du mode clair au mode sombre",
  Moves: "Figures",
  "Choose a move": "Choisir une figure",
  Version: "Version",
  "Good version": "Bonne version",
  "Common mistake": "Erreur fréquente",
  "Animated figures showing the selected move": "Personnages animés qui montrent la figure choisie",
  "Smoothing the motion…": "Lissage du mouvement…",
  Camera: "Caméra",
  Side: "Côté",
  Behind: "Derrière",
  Top: "Dessus",
  POV: "POV",
  "Drag to rotate · scroll to zoom": "Glisser pour tourner · molette pour zoomer",
  "Showing the common mistake": "Voici l’erreur fréquente",
  Zoom: "Zoom",
  "Zoom in": "Zoom avant",
  "Zoom out": "Zoom arrière",
  "Previous count": "Temps précédent",
  "Next count": "Temps suivant",
  Play: "Lecture",
  Pause: "Pause",
  Counts: "Temps",
  Tempo: "Tempo",
  "Tempo presets": "Tempos tout prêts",
  Slow: "Lent",
  Medium: "Moyen",
  Song: "Chanson",
  Click: "Clic",
  "Metronome click on every count": "Un clic de métronome sur chaque temps",
  Guides: "Repères",
  "Arrows, footprints and turn arcs on the stage": "Flèches, empreintes de pas et arcs de tour sur la scène",
  Coaching: "Conseils",
  "Do this": "À faire",
  "Common mistakes": "Erreurs fréquentes",
  "Start slow, around 60 BPM. Real songs run about 120 to 130. This is a simplified guide: directions and hand holds vary between teachers, so check the details with yours.":
    "Commence lentement, vers 60 BPM. Les vraies chansons tournent autour de 120 à 130. Ce guide est simplifié : les directions et les prises de mains changent d’un prof à l’autre, alors vérifie les détails avec le tien.",
  "What you see on the stage": "Ce que tu vois sur la scène",
  "<b>You</b>, the leader": "<b>Toi</b>, le leader",
  "<b>Her</b>, the follower": "<b>Elle</b>, la follower",
  "<b>Gold ring:</b> joined hands": "<b>Anneau doré :</b> mains jointes",
  "<b>Gold arrow:</b> where your left hand goes next": "<b>Flèche dorée :</b> où va ta main gauche ensuite",
  "<b>Shadow:</b> the foot carrying the weight": "<b>Ombre :</b> le pied qui porte le poids",
  "<b>Outlined foot with L or R:</b> your next step": "<b>Pied en contour avec G ou D :</b> ton prochain pas",
  "<b>Dashed foot:</b> a tap, no weight": "<b>Pied en pointillés :</b> un tap, sans poids",
  "<b>Floor arc:</b> who turns, and which way": "<b>Arc au sol :</b> qui tourne, et dans quel sens",
  Close: "Fermer",
  "Two figures dance each move slowly, one count at a time. You are the green one.":
    "Deux personnages dansent chaque figure lentement, un temps à la fois. Tu es le vert.",
  "Practice a move": "Travailler une figure",
  "Pick a move from the list. Start with the basics.": "Choisis une figure dans la liste. Commence par les bases.",
  "Step through the counts with the arrows and read the cue for each one.":
    "Avance temps par temps avec les flèches et lis l’indication de chaque temps.",
  "Press Play at a slow tempo and dance along. Speed up when it feels easy.":
    "Lance la lecture à un tempo lent et danse en même temps. Accélère quand ça devient facile.",
  "Switch to “Common mistake” to see what to avoid, and to POV to see it through your own eyes.":
    "Passe sur « Erreur fréquente » pour voir ce qu’il faut éviter, et sur POV pour le voir avec tes propres yeux.",
  Keyboard: "Clavier",
  "<kbd>Space</kbd>": "<kbd>Espace</kbd>",
  "Play or pause": "Lecture ou pause",
  "One count back or forward": "Un temps en arrière ou en avant",
  "Faster or slower": "Plus vite ou plus lentement",
  "<kbd>1</kbd> to <kbd>4</kbd>": "<kbd>1</kbd> à <kbd>4</kbd>",
  "Camera: side, behind, top, POV": "Caméra : côté, derrière, dessus, POV",
  "Good version or common mistake": "Bonne version ou erreur fréquente",
  "Guides on or off": "Repères affichés ou masqués",
  "Good to know": "Bon à savoir",
  "Drag the stage to rotate the view, or to look around in POV. Moves marked “course” follow one video course and can differ from what your teacher shows. When in doubt, your teacher is right.":
    "Fais glisser la scène pour tourner la vue, ou pour regarder autour de toi en POV. Les figures « du cours » suivent un cours vidéo et peuvent différer de ce que montre ton prof. En cas de doute, c’est ton prof qui a raison.",

  // ---------------------------------------------------------------- interface, written by the code
  Basics: "Bases",
  "From the course": "Du cours",
  Combos: "Enchaînements",
  "Real motion": "Mouvement réel",
  "{n} counts": "{n} temps",
  tap: "tap",
  start: "départ",
  "of {n}": "sur {n}",
  L: "G",
  R: "D",
  "Go to count {c}": "Aller au temps {c}",
  "Count {c}": "Temps {c}",
  "Common mistake · count {c}": "Erreur fréquente · temps {c}",
  "Starting position": "Position de départ",
  "Fix: ": "Correction : ",
  "Then: ": "Ensuite : ",
  "Next, count {n}: ": "Ensuite, temps {n} : ",
  "it starts again from the starting position.": "ça reprend depuis la position de départ.",
  "No mistake version for this one": "Pas de version « erreur » pour celle-ci",
  "Load motion file": "Charger un fichier de mouvement",
  "Load a motion file made with extract_poses.py": "Charger un fichier de mouvement créé avec extract_poses.py",
  "That file doesn’t look like a motion file. Make it with extract_poses.py and load the .poses.json it saves.":
    "Ce fichier ne ressemble pas à un fichier de mouvement. Crée-le avec extract_poses.py et charge le .poses.json qu’il enregistre.",

  // ---------------------------------------------------------------- real-motion mode
  "Position in the clip": "Position dans la vidéo",
  Speed: "Vitesse",
  Mirror: "Miroir",
  "Swap colors": "Inverser les couleurs",
  "Tap the beat": "Tape le rythme",
  "This is count 1": "Ici, c’est le temps 1",
  "No beat set yet": "Pas encore de rythme",
  "Loop from here": "Boucle à partir d’ici",
  "Loop to here": "Boucle jusqu’ici",
  "Clear loop": "Effacer la boucle",
  "Loop {a} → {b}": "Boucle {a} → {b}",
  "Keep tapping: {n}…": "Continue à taper : {n}…",
  "Keep tapping…": "Continue à taper…",
  "{n} BPM. Now pause on a 1 and mark it.": "{n} BPM. Maintenant, mets en pause sur un 1 et marque-le.",
  "Tap the beat first (at least 3 taps).": "Tape d’abord le rythme (au moins 3 fois).",
  "From your video": "Depuis ta vidéo",
  "Real motion from {source} ({length}). These are the actual dancers from the video, traced as stick figures.":
    "Mouvement réel tiré de {source} ({length}). Ce sont les vrais danseurs de la vidéo, tracés en bonshommes bâtons.",
  "Getting started": "Pour commencer",
  "Play it slowly. Tap the beat, then mark count 1 to see the counts.":
    "Lis la vidéo lentement. Tape le rythme, puis marque le temps 1 pour voir les temps.",
  "How to use real motion": "Utiliser le mouvement réel",
  "Play at 0.5× and tap “Tap the beat” on every step for a few counts. Then pause on a count 1 and press “This is count 1.”":
    "Lis à 0,5× et appuie sur « Tape le rythme » à chaque pas pendant quelques temps. Puis mets en pause sur un temps 1 et appuie sur « Ici, c’est le temps 1 ».",
  "Use “Loop from here” and “Loop to here” to repeat a single move.":
    "Utilise « Boucle à partir d’ici » et « Boucle jusqu’ici » pour répéter une seule figure.",
  "“Mirror” flips left and right, so you can follow along as if in a mirror.":
    "« Miroir » inverse la gauche et la droite, pour suivre comme devant un miroir.",
  "If the colors are the wrong way round (you should be green), press “Swap colors.”":
    "Si les couleurs sont inversées (tu dois être en vert), appuie sur « Inverser les couleurs ».",
  "This is a flat view from the camera, not 3D: you can’t rotate it.":
    "C’est une vue à plat depuis la caméra, pas de la 3D : on ne peut pas la tourner.",
  "When the dancers overlap or turn, some joints get lost for a moment. That’s the tracking, not the dancing.":
    "Quand les danseurs se croisent ou tournent, certaines articulations se perdent un instant. C’est le suivi vidéo, pas la danse.",

  // ---------------------------------------------------------------- move and section names
  "Side basic": "Pas de base latéral",
  "Basic in place": "Pas de base sur place",
  "Forward & back": "Avant-arrière",
  "Inside turn": "Tour intérieur",
  "Outside turn": "Tour extérieur",
  "Your turn": "Ton tour",
  "Place swap": "Changement de place",
  Wrap: "Wrap",
  Hammerlock: "Hammerlock",
  "Cross-body lead": "Cross-body lead",
  "Left turn with prep": "Tour à gauche avec prépa",
  "Your turn into hammerlock": "Ton tour, puis hammerlock",
  "Hammerlock exit": "Sortie du hammerlock",
  "Her loop and turn": "Son loop et son tour",
  "Your loop to closed hold": "Ton loop vers la position fermée",
  "Combo 1: Turns": "Enchaînement 1 : les tours",
  "Combo 2: Wrap": "Enchaînement 2 : le wrap",
  "Combo 3: Full dance": "Enchaînement 3 : danse complète",
  "Course combination": "Enchaînement du cours",
  Basic: "Pas de base",
  "Left turn": "Tour à gauche",
  "Your loop and cross-body lead": "Ton loop et cross-body lead",
  "Basic in closed hold": "Pas de base en position fermée",

  // ---------------------------------------------------------------- side basic
  "The base of everything: 3 steps and a tap to your left, then to your right. Learn this first.":
    "La base de tout : 3 pas et un tap vers ta gauche, puis vers ta droite. À apprendre en premier.",
  "Soft knees the whole time. Your hips move because your knees bend.":
    "Genoux souples tout le temps. Tes hanches bougent parce que tes genoux plient.",
  "Steps no wider than your shoulders.": "Des pas pas plus larges que tes épaules.",
  "Tap means no weight. You should be able to lift that foot instantly.":
    "Tap veut dire sans poids. Tu dois pouvoir lever ce pied tout de suite.",
  "Eyes on her, never on your feet.": "Les yeux sur elle, jamais sur tes pieds.",
  "Locked knees, big steps, looking down (shown in the mistake view).":
    "Genoux bloqués, grands pas, regard vers le bas (montré dans la vue « erreur »).",
  "Putting weight on the tap, so you start the next 4 on the wrong foot.":
    "Mettre du poids sur le tap : tu démarres alors les 4 temps suivants du mauvais pied.",
  "Moving the shoulders as much as the hips. The upper body stays calm.":
    "Bouger les épaules autant que les hanches. Le haut du corps reste calme.",
  "Locked knees, giant steps, eyes on the floor.": "Genoux bloqués, pas de géant, yeux au sol.",
  "Soft knees, small steps, eyes on her.": "Genoux souples, petits pas, les yeux sur elle.",
  "Step to your left. Knees soft.": "Un pas à ta gauche. Genoux souples.",
  "Close the right foot.": "Ramène le pied droit.",
  "Step left again.": "Encore un pas à gauche.",
  "Tap right: no weight, hip pops.": "Tap à droite : sans poids, la hanche sort.",
  "Step to your right.": "Un pas à ta droite.",
  "Close the left foot.": "Ramène le pied gauche.",
  "Step right again.": "Encore un pas à droite.",
  "Tap left: no weight.": "Tap à gauche : sans poids.",

  // ---------------------------------------------------------------- basic in place
  "The same rhythm without traveling: 3 small steps and a tap, on the spot. Good for tight dance floors and for slow songs.":
    "Le même rythme sans se déplacer : 3 petits pas et un tap, sur place. Pratique sur une piste pleine et sur les chansons lentes.",
  "Same rhythm as the side basic, the feet just stay under you.":
    "Même rythme que le pas de base latéral, les pieds restent simplement sous toi.",
  "Keep changing weight fully on every step.": "Change complètement de poids à chaque pas.",
  "The hips keep moving even though you don't travel.":
    "Les hanches continuent de bouger même si tu ne te déplaces pas.",
  "Marching with stiff knees.": "Marcher au pas, genoux raides.",
  "Bouncing up and down instead of moving the hips side to side.":
    "Rebondir de haut en bas au lieu de bouger les hanches d’un côté à l’autre.",
  "Step left, on the spot.": "Pas à gauche, sur place.",
  "Step right.": "Pas à droite.",
  "Step left.": "Pas à gauche.",

  // ---------------------------------------------------------------- forward & back
  "3 steps forward and a tap, then 3 steps back and a tap. She mirrors you: when you go forward, she goes back.":
    "3 pas en avant et un tap, puis 3 pas en arrière et un tap. Elle fait le miroir : quand tu avances, elle recule.",
  "Small steps: she is walking backward and can't see where she's going.":
    "Petits pas : elle recule et ne voit pas où elle va.",
  "Move your body first, the arms just follow. Don't push her with your hands.":
    "Bouge d’abord ton corps, les bras suivent. Ne la pousse pas avec les mains.",
  "Keep the same distance between you the whole time.": "Gardez la même distance entre vous tout le temps.",
  "Big steps that run her over.": "De grands pas qui lui foncent dessus.",
  "Pushing and pulling with the arms.": "Pousser et tirer avec les bras.",
  "Looking at your feet.": "Regarder tes pieds.",
  "Step forward on your left. She steps back.": "Avance le pied gauche. Elle recule.",
  "Step forward right.": "Avance le droit.",
  "Step forward left.": "Avance le gauche.",
  "Tap right beside your left foot.": "Tap du droit à côté du pied gauche.",
  "Step back on your right. She comes forward.": "Recule le pied droit. Elle avance.",
  "Step back left.": "Recule le gauche.",
  "Step back right.": "Recule le droit.",
  "Tap left.": "Tap à gauche.",

  // ---------------------------------------------------------------- inside turn
  "She turns to her left under your left hand. Prep on 4, turn on 5-6-7.":
    "Elle tourne vers sa gauche sous ta main gauche. Prépa sur 4, tour sur 5-6-7.",
  "Prep on the tap (4), turn on 5-6-7, catch on 8.": "Prépa sur le tap (4), tour sur 5-6-7, reprise sur 8.",
  "Hand path: up, small circle above her head, down.":
    "Trajet de la main : en haut, petit cercle au-dessus de sa tête, en bas.",
  "Step a little closer during the turn so your arm stays soft.":
    "Rapproche-toi un peu pendant le tour pour que ton bras reste souple.",
  "Fingers loose. Think “hook,” not “grip.”": "Doigts relâchés. Pense « crochet », pas « poigne ».",
  "Too far apart with a stretched arm (shown).": "Trop loin, le bras tendu (montré).",
  "Prep too late: decide on 3, prep on 4.": "Prépa trop tardive : décide sur 3, prépare sur 4.",
  "Gripping her hand so she can’t spin inside it.": "Serrer sa main : elle ne peut plus tourner à l’intérieur.",
  "Too far apart, arm stretched at shoulder height. She has to duck under your arm.":
    "Trop loin, le bras tendu à hauteur d’épaule. Elle doit se baisser pour passer sous ton bras.",
  "Step in. Hand up and over HER head, elbow soft.":
    "Rapproche-toi. La main monte et passe au-dessus de SA tête, coude souple.",
  "Basic. Eyes on her, not your feet.": "Pas de base. Les yeux sur elle, pas sur tes pieds.",
  "Close.": "Ramène.",
  "Step. Decide now.": "Pas. Décide maintenant.",
  "Tap + prep: bring your left hand up near her LEFT ear. Your right hand stays low, still holding hers.":
    "Tap + prépa : monte ta main gauche près de son oreille GAUCHE. Ta main droite reste basse et tient toujours la sienne.",
  "Let go with your right hand. Left hand goes up over HER head. She turns to her left.":
    "Lâche de la main droite. La main gauche monte au-dessus de SA tête. Elle tourne vers sa gauche.",
  "Small circle right above her head.": "Petit cercle juste au-dessus de sa tête.",
  "Hand comes down as she faces you again.": "La main redescend quand elle revient face à toi.",
  "Tap: catch both hands. Back to basic.": "Tap : reprends les deux mains. Retour au pas de base.",

  // ---------------------------------------------------------------- outside turn
  "Same as the inside turn, but she turns to her right. Learn it after the inside turn.":
    "Comme le tour intérieur, mais elle tourne vers sa droite. À apprendre après le tour intérieur.",
  "Same hand and timing as the inside turn.": "Même main et même timing que le tour intérieur.",
  "Only the direction changes: clockwise halo, she turns to her right.":
    "Seul le sens change : auréole dans le sens des aiguilles d’une montre, elle tourne vers sa droite.",
  "If she goes the wrong way, your prep was unclear. Start the small torso turn earlier.":
    "Si elle part du mauvais côté, ta prépa n’était pas claire. Commence la petite rotation du buste plus tôt.",
  "A big stirring circle instead of a halo (shown).": "Un grand cercle de touillage au lieu d’une auréole (montré).",
  "The same prep as the inside turn, so she has to guess.":
    "La même prépa que pour le tour intérieur : elle doit deviner.",
  "Pushing her hand toward her face.": "Pousser sa main vers son visage.",
  "A big stirring circle instead of a small halo. It pulls her off balance.":
    "Un grand cercle de touillage au lieu d’une petite auréole. Ça la déséquilibre.",
  "Keep the circle small, right above her head.": "Garde le cercle petit, juste au-dessus de sa tête.",
  "Basic. Eyes up.": "Pas de base. Regard levé.",
  "Tap + prep: let go right. Bring your left hand up near her RIGHT ear.":
    "Tap + prépa : lâche à droite. Monte ta main gauche près de son oreille DROITE.",
  "Hand up over her head. She turns to her right.": "La main au-dessus de sa tête. Elle tourne vers sa droite.",
  "Small clockwise circle above her head.":
    "Petit cercle dans le sens des aiguilles d’une montre au-dessus de sa tête.",
  "Hand comes down as she faces you.": "La main redescend quand elle est face à toi.",
  "Tap: both hands. Basic.": "Tap : les deux mains. Pas de base.",

  // ---------------------------------------------------------------- your turn
  "You turn to your right under your joined hands while she keeps dancing.":
    "Tu tournes vers ta droite sous vos mains jointes pendant qu’elle continue à danser.",
  "Your hand goes above YOUR head, not hers.": "Ta main passe au-dessus de TA tête, pas de la sienne.",
  "Spotting: eyes on her as long as possible, whip the head, find her again. Watch it in POV.":
    "Le spotting : les yeux sur elle le plus longtemps possible, la tête fouette, tu la retrouves. Regarde-le en POV.",
  "Small steps in place, feet under your body.": "Petits pas sur place, les pieds sous ton corps.",
  "No spotting: the head turns with the body (shown).": "Pas de spotting : la tête tourne avec le corps (montré).",
  "Feet wide apart while turning, so you wobble.": "Pieds trop écartés pendant le tour : tu vacilles.",
  "Letting go of her hand.": "Lâcher sa main.",
  "No spotting: your head turns with your body, so you get dizzy and lose her.":
    "Pas de spotting : ta tête tourne avec ton corps, tu as le tournis et tu la perds.",
  "Eyes stay on her, then the head whips around before the body.":
    "Les yeux restent sur elle, puis la tête fouette avant le corps.",
  "Basic.": "Pas de base.",
  "Tap + prep: let go right, lift left.": "Tap + prépa : lâche à droite, lève la gauche.",
  "Hand above YOUR head. Turn right, eyes stay on her.":
    "La main au-dessus de TA tête. Tourne à droite, les yeux restent sur elle.",
  "Whip your head around. Find her face first.": "Fouette la tête. Retrouve d’abord son visage.",
  "Body catches up with your eyes. Facing her.": "Le corps rattrape tes yeux. Face à elle.",
  "Tap: both hands back.": "Tap : reprends les deux mains.",

  // ---------------------------------------------------------------- place swap
  "Cross-body lead: you step out of her way and she walks across to your side. 8 counts there, 8 counts back.":
    "Cross-body lead : tu sors de son chemin et elle traverse jusqu’à ton côté. 8 temps aller, 8 temps retour.",
  "Your first step is BACK on your left, while you turn to your left. That opens her path.":
    "Ton premier pas est EN ARRIÈRE du pied gauche, en tournant vers ta gauche. Ça ouvre son chemin.",
  "She walks straight across in front of you on 1-2-3, and turns to face you on 5-6-7. Take all 8 counts, don't rush it.":
    "Elle traverse tout droit devant toi sur 1-2-3, et se retourne face à toi sur 5-6-7. Prends les 8 temps, ne te presse pas.",
  "Keep the joined hand at chest height and guide her across with your body, don't pull.":
    "Garde la main jointe à hauteur de poitrine et guide-la avec ton corps, sans tirer.",
  "Stiff legs and big walking steps (shown).": "Jambes raides et grands pas de marche (montré).",
  "Staying on her line, so she has to walk around you.": "Rester sur sa ligne : elle doit te contourner.",
  "Squeezing the whole move into 3 counts. It takes 8.": "Tasser toute la figure en 3 temps. Il en faut 8.",
  "Stiff legs and big steps. You stop dancing and just walk.":
    "Jambes raides et grands pas. Tu arrêtes de danser et tu marches.",
  "Keep small bachata steps and soft knees while you pass.":
    "Garde de petits pas de bachata et les genoux souples pendant le passage.",
  "Step back on your left and start turning left. You open the door.":
    "Recule le pied gauche et commence à tourner à gauche. Tu ouvres la porte.",
  "Keep turning: you're now beside her path. Guide her forward.":
    "Continue de tourner : tu es maintenant à côté de son chemin. Guide-la vers l’avant.",
  "She walks straight past, in front of you.": "Elle passe tout droit, devant toi.",
  "Tap. She's crossing to the other side.": "Tap. Elle traverse de l’autre côté.",
  "Turn to follow her. She starts her half turn to the left.":
    "Tourne pour la suivre. Elle commence son demi-tour à gauche.",
  "She keeps turning to face you.": "Elle continue de tourner pour te faire face.",
  "Facing each other again, on swapped sides.": "De nouveau face à face, côtés échangés.",
  "Tap + prep: get ready to go back.": "Tap + prépa : prépare le retour.",
  "Same way back: step back on your left, turn left.": "Même chose au retour : recule le pied gauche, tourne à gauche.",
  "Keep turning, open her path.": "Continue de tourner, ouvre son chemin.",
  "Tap. She's crossing.": "Tap. Elle traverse.",
  "Turn to follow her. She starts her half turn.": "Tourne pour la suivre. Elle commence son demi-tour.",
  "Home again, facing each other.": "De retour à la place de départ, face à face.",
  "Tap + prep: ready to go again.": "Tap + prépa : prêts à recommencer.",

  // ---------------------------------------------------------------- wrap
  "You turn her into your right arm. She ends at your right side with your arm around her back and her own arms crossed in front. Then you unwrap her. 16 counts.":
    "Tu la fais tourner dans ton bras droit. Elle finit à ta droite, ton bras autour de son dos et ses propres bras croisés devant elle. Puis tu la déroules. 16 temps.",
  "Keep both hands the whole time.": "Garde les deux mains tout le temps.",
  "Your right hand stays low. As she turns she rolls into your right arm: it ends behind her back, with her left hand in yours at her right hip.":
    "Ta main droite reste basse. En tournant, elle s’enroule dans ton bras droit : il finit derrière son dos, sa main gauche dans la tienne à sa hanche droite.",
  "Hand path: up over her head, down in front of her, then in front of her chest.":
    "Trajet de la main : au-dessus de sa tête, redescend devant elle, puis devant sa poitrine.",
  "In the wrap: a hug, not a seatbelt.": "Dans le wrap : un câlin, pas une ceinture de sécurité.",
  "To unwrap, lift the left hand first. The right hand stays low.":
    "Pour dérouler, lève d’abord la main gauche. La main droite reste basse.",
  "Hand coming down across her face (shown).": "La main qui redescend en travers de son visage (montré).",
  "Squeezing her in the wrap.": "La serrer dans le wrap.",
  "Unwrapping with the right hand first.": "Dérouler en commençant par la main droite.",
  "Your hand comes down across her face on 6.": "Ta main redescend en travers de son visage sur 6.",
  "Up over her head, then down in FRONT of her chest.": "Au-dessus de sa tête, puis redescends DEVANT sa poitrine.",
  "Basic, both hands.": "Pas de base, les deux mains.",
  "Tap + prep: keep both hands. Lift your left hand.": "Tap + prépa : garde les deux mains. Lève ta main gauche.",
  "Left hand over her head. She turns left, toward your right side.":
    "La main gauche au-dessus de sa tête. Elle tourne à gauche, vers ton côté droit.",
  "Hand comes down in FRONT of her, a forearm away from her face, then to her chest. Never across her face.":
    "La main redescend DEVANT elle, à un avant-bras de son visage, puis vers sa poitrine. Jamais en travers de son visage.",
  "She lands at your right side, facing the same way. Your right arm is now around her back.":
    "Elle arrive à ta droite, tournée dans le même sens que toi. Ton bras droit entoure maintenant son dos.",
  "Tap: you’re in the wrap. Arms relaxed.": "Tap : vous êtes dans le wrap. Bras détendus.",
  "Basic together in the wrap. Your right hand holds her left hand at her far hip.":
    "Pas de base ensemble dans le wrap. Ta main droite tient sa main gauche à sa hanche opposée.",
  "Tap + prep: lift your left hand first, out in front of her.":
    "Tap + prépa : lève d’abord ta main gauche, devant elle.",
  "Hand goes up. She unwinds to her right.": "La main monte. Elle se déroule vers sa droite.",
  "Right hand stays low and soft. It’s her anchor.": "La main droite reste basse et souple. C’est son point d’ancrage.",
  "She lands back in front of you.": "Elle revient devant toi.",
  "Tap: open position again.": "Tap : de nouveau en position ouverte.",

  // ---------------------------------------------------------------- hammerlock
  "She turns to her right with BOTH hands kept. Your right hand stays low, so her left arm folds behind her back and her left hand ends at her right hip. She finishes at your right side, facing you. Then she unwinds. 16 counts.":
    "Elle tourne vers sa droite en gardant les DEUX mains. Ta main droite reste basse : son bras gauche se replie derrière son dos et sa main gauche finit à sa hanche droite. Elle termine à ta droite, face à toi. Puis elle se déroule. 16 temps.",
  "Keep BOTH hands the whole time.": "Garde les DEUX mains tout le temps.",
  "Your right hand does not chase her. It stays low and almost still, and she turns into it.":
    "Ta main droite ne la poursuit pas. Elle reste basse et presque immobile, et c’est elle qui tourne dedans.",
  "She ends a little to your right, right hip to right hip. That is what leaves room for your arm.":
    "Elle finit un peu sur ta droite, hanche droite contre hanche droite. C’est ce qui laisse de la place à ton bras.",
  "Behind her back means waist height.": "Derrière son dos veut dire à hauteur de taille.",
  "To unwind, lift your left hand again: she turns back to her left.":
    "Pour dérouler, relève ta main gauche : elle retourne vers sa gauche.",
  "Pulling her arm up behind her back (shown).": "Remonter son bras dans son dos (montré).",
  "Reaching around her with your right hand instead of letting her turn into it.":
    "Aller la chercher avec ta main droite au lieu de la laisser tourner dedans.",
  "Letting go of the low hand, so there’s no hammerlock.": "Lâcher la main basse : il n’y a plus de hammerlock.",
  "Lifting the low hand too, so she can’t turn into it.":
    "Lever aussi la main basse : elle ne peut plus tourner dedans.",
  "Her arm is pulled up high behind her back. That hurts her shoulder.":
    "Son bras est remonté haut dans son dos. Ça lui fait mal à l’épaule.",
  "Keep her hand at waist height, relaxed.": "Garde sa main à hauteur de taille, détendue.",
  "Tap + prep: keep BOTH hands. Left hand up near her right ear, right hand stays low.":
    "Tap + prépa : garde les DEUX mains. La main gauche monte près de son oreille droite, la main droite reste basse.",
  "Left hand over her head: she turns to her RIGHT. Your right hand stays low, at her left side.":
    "La main gauche au-dessus de sa tête : elle tourne vers sa DROITE. Ta main droite reste basse, à son côté gauche.",
  "Don’t move your right hand: she turns into it. Her left arm folds behind her back.":
    "Ne bouge pas ta main droite : elle tourne dedans. Son bras gauche se replie derrière son dos.",
  "She faces you again, a little to your right. Her left hand is at her right hip, behind her back.":
    "Elle est de nouveau face à toi, un peu sur ta droite. Sa main gauche est à sa hanche droite, derrière son dos.",
  "Tap: you’re in the hammerlock. Right hip to right hip, left hands low in front.":
    "Tap : vous êtes dans le hammerlock. Hanche droite contre hanche droite, mains gauches basses devant.",
  "Basic in the hammerlock, small steps, close and relaxed.":
    "Pas de base dans le hammerlock, petits pas, proches et détendus.",
  "Tap + prep: lift your left hand near her left ear to unwind.":
    "Tap + prépa : lève ta main gauche près de son oreille gauche pour dérouler.",
  "She unwinds to her LEFT under your left hand. Your right hand still stays low.":
    "Elle se déroule vers sa GAUCHE sous ta main gauche. Ta main droite reste toujours basse.",
  "Her arm unfolds: your right hand is at her left side again.":
    "Son bras se déplie : ta main droite est de nouveau à son côté gauche.",
  "She faces you again.": "Elle est de nouveau face à toi.",
  "Tap: both hands. Done.": "Tap : les deux mains. C’est fini.",

  // ---------------------------------------------------------------- cross-body lead (course)
  "You swap places with her. You step out of her lane on 1-2-3-4 and bring her through on 5-6-7-8. Both hands stay connected. 8 counts there, 8 counts back.":
    "Vous échangez vos places. Tu sors de son couloir sur 1-2-3-4 et tu la fais passer sur 5-6-7-8. Les deux mains restent connectées. 8 temps aller, 8 temps retour.",
  "Counts 1 to 4 are only for you: you get out of her way while she does a small basic.":
    "Les temps 1 à 4 ne sont que pour toi : tu sors de son chemin pendant qu’elle fait un petit pas de base.",
  "Keep your hands where they were, in front of her. If your hands travel with you, she follows you and the lane closes.":
    "Laisse tes mains où elles étaient, devant elle. Si tes mains partent avec toi, elle te suit et le couloir se referme.",
  "On 5-6-7 you walk around to where she was, and she walks straight to where you were.":
    "Sur 5-6-7 tu fais le tour jusqu’à sa place, et elle va tout droit jusqu’à la tienne.",
  "Think “we switch places.” Don’t overthink the feet.":
    "Pense « on échange nos places ». Ne réfléchis pas trop aux pieds.",
  "Taking your hands with you when you step aside, so she follows you.":
    "Emmener tes mains avec toi en t’écartant : elle te suit.",
  "Pulling her through with your arms instead of walking.": "La tirer avec les bras au lieu de marcher.",
  "Standing still on 5-6-7 instead of taking your three steps.":
    "Rester immobile sur 5-6-7 au lieu de faire tes trois pas.",
  "Stepping on her toes: make your side steps clear enough to leave her lane.":
    "Lui marcher sur les pieds : fais des pas de côté assez nets pour sortir de son couloir.",
  "Step left, a bit bigger than in the basic. She does her basic on the spot.":
    "Pas à gauche, un peu plus grand que dans le pas de base. Elle fait son pas de base sur place.",
  "Cross your right foot over. Your hands stay where they were, in front of her.":
    "Croise le pied droit par-dessus. Tes mains restent où elles étaient, devant elle.",
  "Step left again. You’re out of her lane.": "Encore un pas à gauche. Tu es sorti de son couloir.",
  "Tap right. Her path is open on your right side.": "Tap à droite. Son chemin est ouvert sur ta droite.",
  "Step forward on your right, along your own lane, and bring her forward along hers.":
    "Avance le pied droit, dans ton couloir, et fais-la avancer dans le sien.",
  "Second step. You pass right shoulder to right shoulder and both start turning right.":
    "Deuxième pas. Vous vous croisez épaule droite contre épaule droite et vous commencez tous les deux à tourner à droite.",
  "Third step: you’re at her end now, she’s at yours. Keep turning to face her.":
    "Troisième pas : tu es maintenant de son côté, elle du tien. Continue de tourner pour lui faire face.",
  "Tap left. You’ve swapped places and face each other again.":
    "Tap à gauche. Vous avez échangé vos places et vous êtes de nouveau face à face.",

  // ---------------------------------------------------------------- left turn with prep (course)
  "Her left turn under your left hand, the way the course builds it: the hand rises on 3 and 4, she turns on 5-6-7, and you finish with one hand at belt level.":
    "Son tour à gauche sous ta main gauche, comme le cours le construit : la main monte sur 3 et 4, elle tourne sur 5-6-7, et tu finis avec une seule main à hauteur de ceinture.",
  "Before the hand goes up, relax it: slide to a fingertip hold and turn your hand so the fingers point where she will turn.":
    "Avant de lever la main, détends-la : glisse vers une prise du bout des doigts et tourne ta main pour que les doigts pointent là où elle va tourner.",
  "Hand up on 3-4, turn on 5-6-7.": "La main monte sur 3-4, le tour sur 5-6-7.",
  "Draw a circle around her with your hand. Don’t stand back and wait for her to turn by herself.":
    "Dessine un cercle autour d’elle avec ta main. Ne reste pas en retrait à attendre qu’elle tourne toute seule.",
  "On 7-8 the hand comes down to belt level and you do NOT take her other hand.":
    "Sur 7-8 la main redescend à hauteur de ceinture et tu ne prends PAS son autre main.",
  "Lifting the hand with a tight grip, so she can’t rotate inside it.":
    "Lever la main en serrant : elle ne peut plus tourner à l’intérieur.",
  "Staying far back with a stretched arm.": "Rester loin, le bras tendu.",
  "Taking her other hand at the end. The next move needs it free.":
    "Prendre son autre main à la fin. La figure suivante a besoin qu’elle soit libre.",
  "Basic. Relax your left hand: slide down to a fingertip hold.":
    "Pas de base. Détends ta main gauche : glisse vers une prise du bout des doigts.",
  "Close. Turn your left hand so your fingers point the way she will turn.":
    "Ramène. Tourne ta main gauche pour que tes doigts pointent dans le sens où elle va tourner.",
  "Step, and your left hand comes up. Your right hand stays low, still connected.":
    "Pas, et ta main gauche monte. Ta main droite reste basse, toujours connectée.",
  "Tap: left hand high between you. That’s the signal.": "Tap : la main gauche haute entre vous. C’est le signal.",
  "Let go with your right hand. Turn her to her left under your left hand.":
    "Lâche de la main droite. Fais-la tourner vers sa gauche sous ta main gauche.",
  "Draw a circle above her head. Keep doing your own basic.":
    "Dessine un cercle au-dessus de sa tête. Continue ton propre pas de base.",
  "She faces you again. The hand comes down.": "Elle est de nouveau face à toi. La main redescend.",
  "Tap: hand at belt level. Don’t take her other hand.":
    "Tap : la main à hauteur de ceinture. Ne prends pas son autre main.",

  // ---------------------------------------------------------------- your turn into hammerlock (course)
  "You turn to your left on 1-2-3-4 and change to a handshake hold. On 5-6-7-8 you pull her forward past your right side into a hammerlock. Starts with your left hand holding her right.":
    "Tu tournes vers ta gauche sur 1-2-3-4 et tu passes en prise « poignée de main ». Sur 5-6-7-8 tu l’amènes vers l’avant, le long de ton côté droit, jusqu’au hammerlock. Au départ, ta main gauche tient sa main droite.",
  "Every step of your turn travels to your left. Don’t come back to where you started.":
    "Chaque pas de ton tour se déplace vers ta gauche. Ne reviens pas à ton point de départ.",
  "Keep her hand at your waist while you turn. When you let go on 3, your other hand is already there to take it.":
    "Garde sa main à ta taille pendant que tu tournes. Quand tu lâches sur 3, ton autre main est déjà là pour la reprendre.",
  "Step 3 is a little bigger. It leaves a lane on your right side for her.":
    "Le pas 3 est un peu plus grand. Il lui laisse un couloir sur ta droite.",
  "On 5 pull forward at an angle and DOWN, early, so her arm ends behind her back without bending upward.":
    "Sur 5, amène-la vers l’avant en diagonale et vers le BAS, tôt, pour que son bras finisse derrière son dos sans remonter.",
  "Do a basic on the spot on 5-6-7. Don’t just stand there.":
    "Fais un pas de base sur place sur 5-6-7. Ne reste pas planté là.",
  "Lifting her hand to shoulder height in the hammerlock. That twists her arm.":
    "Monter sa main à hauteur d’épaule dans le hammerlock. Ça lui tord le bras.",
  "Stepping back toward her at the end of your turn, so she has no lane.":
    "Revenir vers elle à la fin de ton tour : elle n’a plus de couloir.",
  "Gripping. The hands must be able to slide and rotate against each other.":
    "Serrer. Les mains doivent pouvoir glisser et tourner l’une contre l’autre.",
  "Standing still while she walks.": "Rester immobile pendant qu’elle marche.",
  "Open position. Your left hand holds her right hand at belt level, your right hand is free.":
    "Position ouverte. Ta main gauche tient sa main droite à hauteur de ceinture, ta main droite est libre.",
  "Step left and turn to your LEFT. Keep her hand at your waist.":
    "Pas à gauche et tourne vers ta GAUCHE. Garde sa main à ta taille.",
  "Second step: your back is to her. Her hand slides around your waist.":
    "Deuxième pas : tu lui tournes le dos. Sa main glisse autour de ta taille.",
  "A bigger third step, still travelling left. Let go and keep turning.":
    "Un troisième pas plus grand, toujours vers la gauche. Lâche et continue de tourner.",
  "Tap, facing her. Take her right hand with your RIGHT hand, like a handshake.":
    "Tap, face à elle. Prends sa main droite avec ta main DROITE, comme une poignée de main.",
  "Step on the spot. Pull her forward and down, toward your right side.":
    "Pas sur place. Amène-la vers l’avant et vers le bas, du côté de ta droite.",
  "She walks past your right side and turns to her left. Keep the hand low.":
    "Elle passe le long de ton côté droit et tourne vers sa gauche. Garde la main basse.",
  "Third step. Her right hand slides behind her back, at waist height.":
    "Troisième pas. Sa main droite glisse derrière son dos, à hauteur de taille.",
  "Tap. She has passed you and turned around. Take her left hand in front of her.":
    "Tap. Elle t’a dépassé et s’est retournée. Prends sa main gauche devant elle.",

  // ---------------------------------------------------------------- hammerlock exit (course)
  "From the hammerlock at your right side you send her back the way she came. She turns to her right, and the arms switch: now her left hand is behind her back. Then a basic together.":
    "Depuis le hammerlock à ta droite, tu la renvoies par où elle est venue. Elle tourne vers sa droite, et les bras s’échangent : c’est maintenant sa main gauche qui est derrière son dos. Puis un pas de base ensemble.",
  "Push her left side forward and around with your left hand. It’s a push and a turn at once.":
    "Avec ta main gauche, pousse son côté gauche vers l’avant et en rond. C’est une poussée et un tour en même temps.",
  "As she turns, the hand that was in front slides behind her back and the other comes out.":
    "Pendant qu’elle tourne, la main qui était devant glisse derrière son dos et l’autre ressort.",
  "Step in front of her on 3 and 4.": "Place-toi devant elle sur 3 et 4.",
  "Her joints are sensitive in this hold. Go slowly and keep the hands low.":
    "Ses articulations sont fragiles dans cette prise. Va doucement et garde les mains basses.",
  "Pulling the arm that is behind her back.": "Tirer sur le bras qui est derrière son dos.",
  "Staying beside her instead of stepping in front.": "Rester à côté d’elle au lieu de te placer devant.",
  "Holding the hands so tight that they can’t change places.":
    "Tenir les mains si fort qu’elles ne peuvent plus changer de place.",
  "Hammerlock: she is just past your right side with her right hand behind her back. Left hands are joined in front of her.":
    "Hammerlock : elle est juste après ton côté droit, sa main droite derrière son dos. Les mains gauches sont jointes devant elle.",
  "Send her back the way she came. She steps forward and starts turning to her right.":
    "Renvoie-la par où elle est venue. Elle avance et commence à tourner vers sa droite.",
  "Your left hand guides her left side around. Her right hand comes out from behind her back.":
    "Ta main gauche fait tourner son côté gauche. Sa main droite ressort de derrière son dos.",
  "Step in front of her. Now her LEFT hand goes behind her back.":
    "Place-toi devant elle. C’est maintenant sa main GAUCHE qui passe derrière son dos.",
  "Tap. You face each other, close. One hand behind her back, one in front.":
    "Tap. Vous êtes face à face, proches. Une main derrière son dos, une devant.",
  "Basic together, small steps. Keep the hand behind her back low and relaxed.":
    "Pas de base ensemble, petits pas. Garde la main derrière son dos basse et détendue.",
  "Step.": "Pas.",
  "Tap. Get ready to lift your right hand.": "Tap. Prépare-toi à lever ta main droite.",

  // ---------------------------------------------------------------- her loop and turn (course)
  "A loop: your right hand lifts her right hand straight over her own head and lets it go. Then you turn her to her left with a push on the shoulder. Starts from the close hold with her left hand behind her back.":
    "Un loop : ta main droite monte sa main droite tout droit au-dessus de sa propre tête, puis la lâche. Ensuite tu la fais tourner vers sa gauche en poussant l’épaule. Départ en position rapprochée, sa main gauche derrière son dos.",
  "A loop goes straight up the middle and over her head. A turn starts from the side. That’s how she tells them apart.":
    "Un loop monte tout droit par le milieu et passe au-dessus de sa tête. Un tour part du côté. C’est comme ça qu’elle fait la différence.",
  "Let go by 3, hand on the front of her left shoulder by 4.":
    "Lâche avant 3, la main sur l’avant de son épaule gauche avant 4.",
  "To turn her: push the shoulder with your right hand, pull with your left. Gently. She should still be able to do her basic.":
    "Pour la faire tourner : pousse l’épaule avec ta main droite, tire avec la gauche. Doucement. Elle doit pouvoir continuer son pas de base.",
  "By 6 your right hand is on her left shoulder blade.": "Sur 6, ta main droite est sur son omoplate gauche.",
  "Straighten her arm first and wait until she has almost come round before you move it further.":
    "Déplie d’abord son bras et attends qu’elle ait presque fini de tourner avant de le déplacer davantage.",
  "Pushing her backward instead of turning her. If she falls back, push less and pull more.":
    "La pousser en arrière au lieu de la faire tourner. Si elle part en arrière, pousse moins et tire plus.",
  "Sweeping the loop across her face.": "Faire passer le loop en travers de son visage.",
  "Yanking the arm that was behind her back.": "Tirer d’un coup sur le bras qui était derrière son dos.",
  "Close, facing each other. Her left hand is behind her back in your left hand. Right hands joined in front.":
    "Proches, face à face. Sa main gauche est derrière son dos, dans ta main gauche. Les mains droites sont jointes devant.",
  "Lift your right hand straight up the middle, between you. It’s a loop, not a turn.":
    "Monte ta main droite tout droit par le milieu, entre vous. C’est un loop, pas un tour.",
  "Take it over her head. Soft hand, she lets her elbow open.":
    "Passe-la au-dessus de sa tête. Main souple, elle laisse son coude s’ouvrir.",
  "Let go as your hand comes down past her left ear. Her hand stays by her shoulder.":
    "Lâche quand ta main redescend au niveau de son oreille gauche. Sa main reste près de son épaule.",
  "Tap. Your right hand rests on the front of her left shoulder.":
    "Tap. Ta main droite se pose sur l’avant de son épaule gauche.",
  "Push the shoulder gently, pull your left hand: she turns to her left. Basic to your right.":
    "Pousse doucement l’épaule, tire ta main gauche : elle tourne vers sa gauche. Pas de base vers ta droite.",
  "As her back comes round, put your right hand on her left shoulder blade.":
    "Quand son dos arrive, pose ta main droite sur son omoplate gauche.",
  "Third step. Wait until she is almost round before you move her arm.":
    "Troisième pas. Attends qu’elle ait presque fini de tourner avant de déplacer son bras.",
  "Tap. She is almost round. Lift your left hand, with her hand in it.":
    "Tap. Elle a presque fini de tourner. Lève ta main gauche, avec sa main dedans.",

  // ---------------------------------------------------------------- your loop to closed hold (course)
  "You take your own left hand over your head, so her hand lands behind your neck: a closed hold. Meanwhile you step out of her lane, then bring her through on your right side. Ends with a basic in closed hold.":
    "Tu passes ta propre main gauche au-dessus de ta tête, et sa main se pose derrière ta nuque : une position fermée. Pendant ce temps tu sors de son couloir, puis tu la fais passer sur ta droite. Ça finit par un pas de base en position fermée.",
  "Lift your elbow to make a tunnel and put your own head through it.":
    "Lève le coude pour faire un tunnel et passe ta propre tête dedans.",
  "While you loop on 1-2-3 you are already stepping left, out of her way. Step 3 is the bigger one.":
    "Pendant ton loop sur 1-2-3 tu pars déjà vers la gauche, hors de son chemin. Le pas 3 est le plus grand.",
  "Then it’s the same cross-body lead as at the start, just in a closed hold.":
    "Ensuite c’est le même cross-body lead qu’au début, mais en position fermée.",
  "Small steps. In a closed hold her feet are right next to yours.":
    "Petits pas. En position fermée, ses pieds sont juste à côté des tiens.",
  "Forgetting to step aside while you loop, so there’s no room to bring her through.":
    "Oublier de t’écarter pendant ton loop : il n’y a plus de place pour la faire passer.",
  "Dropping her hand on your head instead of behind your neck.":
    "Laisser sa main sur ta tête au lieu de derrière ta nuque.",
  "Stepping on her toes.": "Lui marcher sur les pieds.",
  "She has almost finished her turn. Your right hand is on her shoulder blade, left hands joined and rising.":
    "Elle a presque fini son tour. Ta main droite est sur son omoplate, les mains gauches sont jointes et montent.",
  "Step left. Lift your elbow and take your left hand over YOUR head, her hand with it.":
    "Pas à gauche. Lève le coude et passe ta main gauche au-dessus de TA tête, avec sa main.",
  "Cross over. Leave her hand behind your neck, then take her right hand with your left.":
    "Croise. Laisse sa main derrière ta nuque, puis prends sa main droite avec ta gauche.",
  "A bigger step left. You’re in a closed hold and out of her lane.":
    "Un pas plus grand à gauche. Tu es en position fermée et hors de son couloir.",
  "Tap.": "Tap.",
  "Step forward on your right and bring her through on your right side.":
    "Avance le pied droit et fais-la passer sur ta droite.",
  "Turn to your right together. Stay close.": "Tournez ensemble vers ta droite. Restez proches.",
  "Third step: you’ve swapped places.": "Troisième pas : vous avez échangé vos places.",
  "Tap. Closed hold, facing each other.": "Tap. Position fermée, face à face.",
  "Basic in the closed hold. Step left.": "Pas de base en position fermée. Pas à gauche.",
  "Tap. That’s the whole combination.": "Tap. C’est tout l’enchaînement.",

  // ---------------------------------------------------------------- combos
  "Basic, inside turn, basic, outside turn. 32 counts. Your first full sequence.":
    "Pas de base, tour intérieur, pas de base, tour extérieur. 32 temps. Ton premier enchaînement complet.",
  "Basic, wrap in and out, then an inside turn. 32 counts.":
    "Pas de base, wrap aller-retour, puis un tour intérieur. 32 temps.",
  "Inside turn, hammerlock, your turn, place swap, wrap. 64 counts with no plain basics in between.":
    "Tour intérieur, hammerlock, ton tour, changement de place, wrap. 64 temps, sans pas de base entre les figures.",
  "Every move ends in open hold, facing each other, so the next one can start cleanly.":
    "Chaque figure finit en position ouverte, face à face, pour que la suivante démarre proprement.",
  "Decide the next move on count 3, prep on the tap.": "Décide la figure suivante sur le temps 3, prépare sur le tap.",
  "If you lose it, do a basic and start again on the next 1.":
    "Si tu te perds, fais un pas de base et repars sur le 1 suivant.",
  "Rushing into the next move before finishing the tap.":
    "Te précipiter dans la figure suivante avant d’avoir fini le tap.",
  "Thinking so hard about the next move that you stop looking at her.":
    "Réfléchir si fort à la figure suivante que tu ne la regardes plus.",
  "The whole sequence from the Demetrio & Nicole course, in order: basic, cross-body lead, her left turn, your turn into the hammerlock, the exit, her loop and turn, your loop, and a cross-body lead in closed hold. 64 counts.":
    "Tout l’enchaînement du cours de Demetrio & Nicole, dans l’ordre : pas de base, cross-body lead, son tour à gauche, ton tour puis le hammerlock, la sortie, son loop et son tour, ton loop, et un cross-body lead en position fermée. 64 temps.",
  "Learn it one section at a time: each section is also in the list under “From the course.”":
    "Apprends-le une partie à la fois : chaque partie est aussi dans la liste, sous « Du cours ».",
  "There is no basic between the sections. While you finish one, you are already preparing the next.":
    "Il n’y a pas de pas de base entre les parties. Pendant que tu en finis une, tu prépares déjà la suivante.",
  "In class you would put a basic between the moves. Do that whenever you need time to think.":
    "En cours, on mettrait un pas de base entre les figures. Fais-le dès que tu as besoin de temps pour réfléchir.",
  "If she is new to this too, go slowly and let each other make mistakes.":
    "Si elle débute aussi, allez-y doucement et laissez-vous le droit à l’erreur.",
  "After your own turn, going back into a basic instead of stepping out of her way.":
    "Après ton propre tour, repartir en pas de base au lieu de sortir de son chemin.",
  "Taking her free hand after her left turn. You need it free for your turn.":
    "Prendre sa main libre après son tour à gauche. Tu as besoin qu’elle soit libre pour ton tour.",
  "Rushing the hammerlock. Keep those hands low and gentle.":
    "Précipiter le hammerlock. Garde les mains basses et douces.",
  "Open position, both hands. You start with one basic.":
    "Position ouverte, les deux mains. Tu commences par un pas de base.",
};
// the follower's texts live in their own file
Object.assign(fr, frFollower);
