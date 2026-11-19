// What the body builder produces: plain shapes in meters, with no drawing code attached.
// The renderer draws them; the checks measure them.

export type Vec3 = [number, number, number] | number[];

export interface Shape {
  /** c = tapered capsule, o = ball, p = flat panel, h = head, x = collision-only volume, loft = torso surface */
  t: "c" | "o" | "p" | "h" | "x" | "loft";
  /** Which dancer: l = leader, f = follower. */
  id: string;
  lead?: boolean;
  /** L / R for limbs, C for the centre line. */
  side?: string;
  col?: string;
  /** Body part name. Only shapes with a part take part in collision checks. */
  part?: string;
  a?: Vec3;
  b?: Vec3;
  wa?: number;
  wb?: number;
  ra?: number;
  rb?: number;
  p?: Vec3;
  r?: number;
  pts?: Vec3[];
  [extra: string]: any;
}

/** Colours and the clock the body builder needs. */
export interface BodyEnv {
  skin: string;
  hair: string;
  /** Seconds-like running time, only used to ripple the skirt hem. */
  time: number;
}
