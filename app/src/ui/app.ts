// The interface: move list, transport, coaching panel, keyboard. It owns no dance logic: it asks the engine
// for the current frame and hands it to the stage.
import * as engine from "../engine";
import { moves } from "../engine";
import { Stage } from "../render/stage";
import type { ViewName } from "../render/camera";
import { RealMotion } from "./motion";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const HINT = "Drag to rotate · scroll to zoom";
const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
};
const UPLOAD =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14"/></svg><span>Load motion file</span>';

export class App {
  private stage = new Stage($<HTMLCanvasElement>("floor"), $<HTMLCanvasElement>("gl"), $<HTMLCanvasElement>("over"));
  private motion = new RealMotion();
  private colors: Record<string, string> = {};
  private chips: HTMLButtonElement[] = [];
  private move = 0;
  private mistake = false;
  /** Time in counts. */
  private t = 0;
  private playing = false;
  private bpm = 60;
  private sound = true;
  private guides = true;
  private audio: AudioContext | null = null;
  private lastBeat = 0;
  private shownCount = -1;
  private lastFrame = performance.now();

  constructor() {
    this.readColors();
    this.buildMoveList();
    this.bindControls();
    this.resize();
    this.setPlaying(false);
    this.select(0);
    new MutationObserver(() => this.readColors()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("resize", () => this.resize());
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe($("stage"));
    requestAnimationFrame((now) => this.loop(now));
  }

  // ---------------------------------------------------------------- state the tests and tools may read or set
  get state() {
    return {
      move: this.move,
      mistake: this.mistake,
      t: this.t,
      playing: this.playing,
      bpm: this.bpm,
      sound: this.sound,
      guides: this.guides,
      counts: engine.counts(),
      noLoop: engine.noLoop(),
      view: this.stage.camera.view,
      zoom: this.stage.camera.zoom,
      yaw: this.stage.camera.yaw,
      baked: engine.bakeProgress() >= 1,
      realMotion: this.motion.active,
      motionTime: this.motion.t,
      motionBpm: this.motion.bpm,
    };
  }
  seek(t: number) {
    this.t = t;
    this.lastBeat = Math.floor(t);
  }
  get camera() {
    return this.stage.camera;
  }

  // ---------------------------------------------------------------- setup
  private readColors() {
    const css = getComputedStyle(document.documentElement);
    for (const k of ["ink", "muted", "lead", "fol", "floor", "panel", "join", "bg", "bad", "skin", "hair"])
      this.colors[k] = css.getPropertyValue("--" + k).trim();
  }

  private buildMoveList() {
    const list = $("chips");
    let lastGroup = "";
    moves.forEach((m, i) => {
      const group = engine.groupOf(i);
      if (group !== lastGroup) {
        lastGroup = group;
        list.appendChild(Object.assign(document.createElement("span"), { className: "chipsep", textContent: group }));
      }
      const b = document.createElement("button"),
        name = document.createElement("span"),
        count = document.createElement("span");
      b.className = "chip";
      name.className = "nm";
      name.textContent = engine.shortName(i);
      count.className = "ct";
      count.textContent = String(m.keys.length);
      count.title = m.keys.length + " counts";
      b.append(name, count);
      b.setAttribute("aria-label", `${engine.shortName(i)}, ${m.keys.length} counts`);
      b.onclick = () => {
        this.select(i);
        if (window.innerWidth < 1280) b.scrollIntoView({ block: "nearest", inline: "center" });
      };
      list.appendChild(b);
      this.chips.push(b);
    });
    list.appendChild(
      Object.assign(document.createElement("span"), { className: "chipsep", textContent: "Real motion" }),
    );
    const label = document.createElement("label"),
      input = document.createElement("input");
    label.className = "chip file";
    label.innerHTML = UPLOAD;
    input.type = "file";
    input.accept = ".json,application/json";
    input.setAttribute("aria-label", "Load a motion file made with extract_poses.py");
    label.appendChild(input);
    list.appendChild(label);
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          this.openMotion(JSON.parse(text), file.name);
        } catch {
          $("cue").textContent =
            "That file doesn’t look like a motion file. Make it with extract_poses.py and load the .poses.json it saves.";
        }
        input.value = "";
      });
    };
  }

  private bindControls() {
    const cam = this.stage.camera;
    $("mGood").onclick = () => this.setMistake(false);
    $("mBad").onclick = () => this.setMistake(true);
    $("play").onclick = () => this.setPlaying(!this.playing);
    $("prev").onclick = () => this.step(-1);
    $("next").onclick = () => this.step(1);
    $("snd").onclick = (e) => {
      this.sound = !this.sound;
      (e.currentTarget as HTMLElement).setAttribute("aria-pressed", String(this.sound));
    };
    $("gd").onclick = (e) => {
      this.guides = !this.guides;
      (e.currentTarget as HTMLElement).setAttribute("aria-pressed", String(this.guides));
    };
    $<HTMLInputElement>("bpm").oninput = (e) => this.setBpm(+(e.target as HTMLInputElement).value);
    document
      .querySelectorAll<HTMLElement>(".presets button")
      .forEach((b) => (b.onclick = () => this.setBpm(+b.dataset.bpm!)));
    $("zin").onclick = () => cam.zoomBy(1.15);
    $("zout").onclick = () => cam.zoomBy(1 / 1.15);
    document
      .querySelectorAll<HTMLElement>(".views button")
      .forEach((b) => (b.onclick = () => this.setView(b.dataset.v as ViewName)));
    $("themeBtn").onclick = () => {
      const root = document.documentElement,
        next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("bpr-theme", next);
      } catch {
        /* private browsing: the choice just isn't remembered */
      }
    };
    const help = $<HTMLDialogElement>("help");
    $("helpBtn").onclick = () => {
      this.setPlaying(false);
      help.showModal();
    };
    $("helpClose").onclick = () => help.close();
    help.addEventListener("click", (e) => e.target === help && help.close());

    // drag to rotate, wheel to zoom
    const over = $("over");
    let drag: [number, number] | null = null;
    over.addEventListener("pointerdown", (e) => {
      drag = [e.clientX, e.clientY];
      over.setPointerCapture(e.pointerId);
    });
    over.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.drag(e.clientX - drag[0], e.clientY - drag[1]);
      drag = [e.clientX, e.clientY];
      if (!cam.pov) this.markView();
    });
    over.addEventListener("pointerup", () => (drag = null));
    over.addEventListener("pointercancel", () => (drag = null));
    over.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        cam.zoomBy(e.deltaY < 0 ? 1.08 : 0.93);
      },
      { passive: false },
    );

    document.addEventListener("keydown", (e) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.metaKey || e.ctrlKey || e.altKey || tag === "INPUT" || tag === "SELECT" || help.open) return;
      if (e.code === "Space") {
        if (tag === "BUTTON") return;
        e.preventDefault();
        this.setPlaying(!this.playing);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.step(-1);
      } else if (this.motion.active) return;
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.setBpm(this.bpm + 4);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.setBpm(this.bpm - 4);
      } else if (e.key >= "1" && e.key <= "4") this.setView((["side", "you", "top", "pov"] as ViewName[])[+e.key - 1]);
      else if (e.key === "m" || e.key === "M") this.setMistake(!this.mistake);
      else if (e.key === "g" || e.key === "G") $("gd").click();
    });

    // real-motion controls
    const mo = this.motion;
    $<HTMLInputElement>("mscrub").oninput = (e) => {
      this.setPlaying(false);
      mo.t = +(e.target as HTMLInputElement).value * mo.duration;
    };
    $<HTMLSelectElement>("mrate").onchange = (e) => (mo.rate = +(e.target as HTMLSelectElement).value);
    $("mmir").onclick = (e) => {
      mo.mirror = !mo.mirror;
      (e.currentTarget as HTMLElement).setAttribute("aria-pressed", String(mo.mirror));
    };
    $("mswap").onclick = () => (mo.swapColors = !mo.swapColors);
    $("mtap").onclick = () => ($("mbpm").textContent = mo.tap());
    $("mone").onclick = () => ($("mbpm").textContent = mo.markOne());
    const showLoop = () =>
      ($("mloop").textContent =
        mo.loopFrom != null || mo.loopTo != null
          ? `Loop ${clock(mo.loopFrom ?? 0)} → ${clock(mo.loopTo ?? mo.duration)}`
          : "");
    $("mA").onclick = () => {
      mo.loopFrom = mo.t;
      if (mo.loopTo != null && mo.loopTo <= mo.t) mo.loopTo = null;
      showLoop();
    };
    $("mB").onclick = () => {
      if (mo.t > (mo.loopFrom ?? 0) + 0.2) {
        mo.loopTo = mo.t;
        mo.t = mo.loopFrom ?? 0;
      }
      showLoop();
    };
    $("mclr").onclick = () => {
      mo.loopFrom = mo.loopTo = null;
      showLoop();
    };
  }

  // ---------------------------------------------------------------- actions
  select(index: number) {
    this.closeMotion();
    this.move = index;
    const m = moves[index];
    if (!m.mistake) this.mistake = false;
    this.t = 0;
    this.lastBeat = 0;
    engine.load(index, this.mistake, false);
    this.markMistake();
    const N = engine.counts(),
      mBad = $<HTMLButtonElement>("mBad");
    mBad.disabled = !m.mistake;
    mBad.title = m.mistake ? "" : "No mistake version for this one";
    this.chips.forEach((b, j) => b.setAttribute("aria-pressed", String(j === index)));

    const beats = $("beats");
    beats.innerHTML = "";
    beats.classList.toggle("long", N > 16);
    beats.style.gridTemplateColumns = `repeat(${N > 16 && window.innerWidth >= 700 ? 16 : 8},1fr)`;
    for (let c = 1; c <= N; c++) {
      const b = document.createElement("button"),
        key = m.keys[c - 1];
      b.className = "beat" + (c % 4 === 0 ? " tapc" : "") + (m.combo && key.segStart ? " seg0" : "");
      b.textContent = c % 4 === 0 ? "tap" : String(N > 16 ? ((c - 1) % 8) + 1 : c);
      b.setAttribute("aria-label", `Go to count ${c}` + (m.combo ? ` (${key.seg})` : ""));
      if (m.combo) b.title = key.seg ?? "";
      b.onclick = () => {
        this.seek(engine.noLoop() ? c : c % N);
        this.setPlaying(false);
      };
      beats.appendChild(b);
    }
    $("mname").textContent = engine.shortName(index);
    $("eyebrow").textContent = `${engine.groupOf(index)} · ${N} counts`;
    $("about").textContent = m.about;
    $("dtitle").textContent = "Do this";
    $("etitle").textContent = "Common mistakes";
    fillList($("dlist"), m.tips);
    fillList($("elist"), m.errors);
    this.showCount(true);
  }

  setMistake(on: boolean) {
    if (on && !moves[this.move].mistake) return;
    this.mistake = on;
    engine.load(this.move, on, false);
    this.markMistake();
    this.showCount(true);
  }
  private markMistake() {
    const b = this.mistake;
    $("mGood").setAttribute("aria-pressed", String(!b));
    $("mBad").setAttribute("aria-pressed", String(b));
    $("stage").classList.toggle("bad", b);
    $("cueCard").classList.toggle("bad", b);
    $("youDot").style.background = b ? "var(--bad)" : "var(--lead)";
    $("hint").textContent = b ? "Showing the common mistake" : HINT;
  }

  setPlaying(on: boolean) {
    this.playing = on;
    const b = $("play");
    b.querySelector(".ic")!.innerHTML = on ? ICON.pause : ICON.play;
    b.querySelector(".lb")!.textContent = on ? "Pause" : "Play";
    b.setAttribute("aria-label", on ? "Pause" : "Play");
    if (on) {
      try {
        this.audio ??= new (window.AudioContext || (window as any).webkitAudioContext)();
        this.audio.resume();
      } catch {
        /* no sound available: play silently */
      }
    }
  }

  /** One count forward or back (one video frame in real-motion mode). */
  step(d: number) {
    this.setPlaying(false);
    if (this.motion.active) return this.motion.stepFrames(d);
    const N = engine.counts();
    this.seek(engine.noLoop() ? (Math.round(this.t) + d + N + 1) % (N + 1) : (Math.round(this.t) + d + N) % N);
  }

  setBpm(value: number) {
    this.bpm = Math.min(130, Math.max(40, value));
    $<HTMLInputElement>("bpm").value = String(this.bpm);
    $("bpmo").textContent = this.bpm + " BPM";
    document
      .querySelectorAll<HTMLElement>(".presets button")
      .forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.bpm! === this.bpm)));
  }

  setView(name: ViewName) {
    this.stage.camera.setView(name);
    this.markView();
  }
  private markView() {
    const view = this.stage.camera.view;
    document
      .querySelectorAll<HTMLElement>(".views button")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === view)));
  }

  // ---------------------------------------------------------------- real motion
  private openMotion(obj: any, name: string) {
    this.motion.load(obj);
    this.setPlaying(false);
    this.mistake = false;
    this.markMistake();
    document.body.classList.add("motion");
    $("mbar").hidden = false;
    this.chips.forEach((b) => b.setAttribute("aria-pressed", "false"));
    $("mbpm").textContent = "No beat set yet";
    $("mloop").textContent = "";
    $("mname").textContent = "Real motion";
    $("eyebrow").textContent = "From your video";
    $("about").textContent =
      `Real motion from ${this.motion.data.source || name} (${clock(this.motion.duration)}). These are the actual dancers from the video, traced as stick figures.`;
    $("cueEyebrow").textContent = "Getting started";
    $("cue").textContent = "Play it slowly. Tap the beat, then mark count 1 to see the counts.";
    $("cue").classList.remove("bad");
    $("fix").hidden = true;
    $("nextCue").hidden = true;
    $("hint").textContent = "";
    $("dtitle").textContent = "How to use real motion";
    fillList($("dlist"), [
      "Play at 0.5× and tap “Tap the beat” on every step for a few counts. Then pause on a count 1 and press “This is count 1.”",
      "Use “Loop from here” and “Loop to here” to repeat a single move.",
      "“Mirror” flips left and right, so you can follow along as if in a mirror.",
      "If the colors are the wrong way round (you should be green), press “Swap colors.”",
    ]);
    $("etitle").textContent = "Good to know";
    fillList($("elist"), [
      "This is a flat view from the camera, not 3D: you can’t rotate it.",
      "When the dancers overlap or turn, some joints get lost for a moment. That’s the tracking, not the dancing.",
    ]);
  }
  private closeMotion() {
    if (!this.motion.active) return;
    this.motion.close();
    document.body.classList.remove("motion");
    $("mbar").hidden = true;
    $("hint").textContent = HINT;
    this.setPlaying(false);
  }

  // ---------------------------------------------------------------- every frame
  private resize() {
    const W = $("stage").getBoundingClientRect().width;
    if (!W) return;
    const H = Math.round(
      Math.min(
        Math.max(W * (W < 520 ? 0.95 : 0.8), 300),
        Math.max(460, Math.min(700, window.innerHeight - (window.innerWidth >= 900 ? 330 : 170))),
      ),
    );
    if (Math.abs(W - this.stage.width) < 1 && H === this.stage.height) return;
    $("stage").style.height = H + "px";
    this.stage.resize(W, H);
  }

  private click(count: number) {
    if (!this.sound || !this.audio) return;
    const a = this.audio,
      o = a.createOscillator(),
      g = a.createGain(),
      now = a.currentTime;
    o.frequency.value = count === 1 || count === 9 ? 1600 : count % 4 === 0 ? 620 : 1050;
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    o.connect(g).connect(a.destination);
    o.start(now);
    o.stop(now + 0.07);
  }

  private loop(now: number) {
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.motion.active) {
      if (this.playing) {
        const beat = this.motion.advance(dt);
        if (beat) this.click(beat);
      }
      this.motion.draw(this.stage.flat(), this.stage.width, this.stage.height, this.stage.camera.zoom, {
        lead: this.colors.lead,
        follow: this.colors.fol,
        floor: this.colors.floor,
      });
      this.showMotionCount();
    } else {
      const N = engine.counts();
      if (this.playing) {
        this.t += (dt * this.bpm) / 60;
        if (engine.noLoop() ? this.t > N : this.t >= N) this.t -= N;
        const beat = Math.floor(this.t);
        if (beat !== this.lastBeat) {
          this.lastBeat = beat;
          this.click(beat === 0 ? N : beat);
        }
      }
      // smooth the move's motion in the background, a few milliseconds per frame
      $("baking").hidden = engine.bakeSome(7);
      engine.setTime(engine.noLoop() ? Math.min(this.t, N) : this.t % N);
      const lead = this.mistake ? this.colors.bad : this.colors.lead;
      const frame = engine.frame({ lead, follow: this.colors.fol, skin: this.colors.skin, hair: this.colors.hair });
      this.stage.draw(
        frame,
        { on: this.guides, lead },
        { floor: this.colors.floor, lead, follow: this.colors.fol, join: this.colors.join, bg: this.colors.bg },
      );
      this.showCount(false);
    }
    requestAnimationFrame((n) => this.loop(n));
  }

  /** The count shown in the corner and the cue in the coaching panel. */
  private showCount(force: boolean) {
    const N = engine.counts(),
      noLoop = engine.noLoop();
    const c = noLoop ? Math.min(N, Math.max(0, Math.round(this.t))) : Math.round(this.t) % N || N;
    if (c === this.shownCount && !force) return;
    this.shownCount = c;
    const m = moves[this.move],
      atStart = noLoop && c === 0,
      key = atStart ? m.start! : m.keys[c - 1],
      next = (c % N) + 1;
    const tap = !atStart && c % 4 === 0,
      big = $("count");
    big.firstChild!.nodeValue = String(c);
    big.classList.toggle("tap", tap);
    big.querySelector("small")!.textContent = atStart
      ? "start"
      : m.combo
        ? key.seg + (tap ? " · tap" : "")
        : tap
          ? "tap"
          : "of " + N;
    const bad = this.mistake && m.mistake;
    $("cueEyebrow").textContent = atStart
      ? "Starting position"
      : (bad ? "Common mistake · count " : "Count ") + c + (tap ? " · tap" : "") + (m.combo ? " · " + key.seg : "");
    const cue = $("cue"),
      fix = $("fix"),
      nx = $("nextCue");
    cue.classList.toggle("bad", !!bad);
    if (bad) {
      cue.textContent = m.mistake!.what;
      fix.replaceChildren(Object.assign(document.createElement("b"), { textContent: "Fix: " }), m.mistake!.fix);
      fix.hidden = false;
      nx.hidden = true;
    } else {
      cue.textContent = key.cue;
      fix.hidden = true;
      nx.hidden = false;
      const lastOfSet = noLoop && c === N;
      nx.replaceChildren(
        Object.assign(document.createElement("b"), { textContent: lastOfSet ? "Then: " : `Next, count ${next}: ` }),
        lastOfSet ? "it starts again from the starting position." : m.keys[next - 1].cue,
      );
    }
    [...$("beats").children].forEach((b, i) => {
      b.classList.toggle("on", i + 1 === c);
      i + 1 === c ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current");
    });
  }

  private showMotionCount() {
    const c = this.motion.count(),
      tap = c === 4 || c === 8,
      big = $("count");
    big.firstChild!.nodeValue = c ? String(c) : "·";
    big.classList.toggle("tap", tap);
    big.querySelector("small")!.textContent = clock(this.motion.t) + (tap ? " · tap" : "");
    const scrub = $<HTMLInputElement>("mscrub");
    if (document.activeElement !== scrub)
      scrub.value = String(this.motion.duration ? this.motion.t / this.motion.duration : 0);
    this.shownCount = -1;
  }
}

function fillList(ul: HTMLElement, lines: string[]) {
  ul.replaceChildren(...lines.map((text) => Object.assign(document.createElement("li"), { textContent: text })));
}
/** Seconds as m:ss.t */
function clock(x: number) {
  return `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}.${Math.floor((x * 10) % 10)}`;
}
