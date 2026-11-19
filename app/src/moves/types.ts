// The shape of the choreography data.

export type Side = "L" | "R";
export type Who = "l" | "f"; // leader, follower

/** Where one dancer is on one count. x and z are floor meters, th is the facing angle in degrees. */
export interface DancerKey {
  x: number;
  z: number;
  th: number;
  /** basic = side basic footwork; turn = planted, stepping feet. */
  mode?: "basic" | "turn";
  /** Basic footwork variant: on the spot, or forward and back. */
  fw?: "place" | "fwd";
  /** Pivot turn on the spot that sways like the basic. */
  drift?: number;
  /** Turn with feet kept under the body. */
  pvt?: number;
  /** Follower footedness for a turn (right foot first). */
  mir?: number;
  soft?: number;
  /** The stepping foot crosses in front of the standing one. */
  cross?: number;
}

/** One hand connection: [leader's hand or null, follower's hand or null, named position]. */
export type HandLink = [Side | null, Side | null, string];

/** One count of a move. */
export interface Key {
  l: DancerKey;
  f: DancerKey;
  h: HandLink[];
  /** What the leader should do on this count. */
  cue: string;
  /** Travel axis for a basic, when the leader is not in basic mode. */
  ax?: number;
  /** In a combo: which section this count belongs to, and whether it starts one. */
  seg?: string;
  segStart?: boolean;
}

export interface Mistake {
  flags?: Record<string, number>;
  swap?: Record<string, string>;
  swapAt?: Record<number, Record<string, string>>;
  what: string;
  fix: string;
}

export interface Move {
  name: string;
  about: string;
  keys: Key[];
  tips: string[];
  errors: string[];
  mistake?: Mistake;
  combo?: boolean;
  parts?: string[];
  /** A starting position. A move that has one does not loop. */
  start?: Key;
}

/** An 8-count building block of the course combination. */
export interface Section {
  seg: string;
  keys: Key[];
  start?: Key;
  name?: string;
}
