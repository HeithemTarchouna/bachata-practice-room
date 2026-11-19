// The engine's front door. Everything outside the engine (renderer, interface, checks) goes through here.
import { body } from "./figure";
import {
  couple,
  load as loadRaw,
  setTime,
  time,
  counts,
  noLoop,
  flags,
  keyStates,
  poseAt,
  moveIndex,
  isMistake,
} from "./sim";
import { startBake, step, applyTrack, progress, type BakeJob, type Track } from "./bake";
import type { Shape } from "./shapes";
import { moves } from "../moves/library";

export { moves, setTime, time, counts, noLoop, flags, keyStates, poseAt, moveIndex, isMistake };

let job: BakeJob | null = null;
let track: Track | null = null;

/**
 * Load a move. With `wait` (the default) its motion is baked and smoothed before this returns.
 * The interface passes wait=false and calls `bakeSome` between frames, so a long combo does not freeze the page.
 */
export function load(index: number, mistake = false, wait = true) {
  loadRaw(index, mistake);
  track = null;
  job = startBake();
  if (wait) bakeSome(Infinity);
}
/** Continue baking for a few milliseconds. Returns true once the smoothed motion is in use. */
export function bakeSome(budgetMs: number): boolean {
  if (track) return true;
  if (job && step(job, budgetMs)) track = job.track;
  return !!track;
}
/** 0..1: how much of the current move is baked. */
export const bakeProgress = () => (track ? 1 : job ? progress(job) : 0);
export type { Shape };

export interface Palette {
  lead: string;
  follow: string;
  skin: string;
  hair: string;
}
export const DEFAULT_PALETTE: Palette = { lead: "#127A6A", follow: "#C2416B", skin: "#E6C1A3", hair: "#2A1F1C" };

export interface Frame {
  /** Leader and follower poses: facing, hips, feet, hands. */
  Pl: any;
  Pf: any;
  /** Every shape of both bodies. */
  shapes: Shape[];
  /** Shoulder and hip points of each dancer, for the renderer. */
  lead: any;
  follow: any;
}

/** Both dancers at the current time, as poses and as shapes. */
export function frame(palette: Palette = DEFAULT_PALETTE): Frame {
  const { Pl, Pf } = couple();
  if (track) applyTrack(track, Pl, Pf, time());
  const shapes: Shape[] = [];
  const env = { skin: palette.skin, hair: palette.hair, time: time() };
  const lead = body(Pl, palette.lead, shapes, true, env);
  const follow = body(Pf, palette.follow, shapes, false, env);
  return { Pl, Pf, shapes, lead, follow };
}

/** Group label of a move, used by the move list. */
export function groupOf(index: number): string {
  const m = moves[index];
  if (index < 3) return "Basics";
  if (m.combo) return "Combos";
  if (/\(course\)/.test(m.name)) return "From the course";
  return "Moves";
}
export const shortName = (index: number) => moves[index].name.replace(" (course)", "");
