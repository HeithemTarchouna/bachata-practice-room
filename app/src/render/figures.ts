// Draws the dancers in real 3D from the engine's shape list.
// The engine says WHAT is where (capsules, balls, a torso surface, skirt panels); this file only draws it.
import * as THREE from "three";
import type { Shape } from "../engine";

type V = number[];
const UP = new THREE.Vector3(0, 1, 0);

/** A set of reusable meshes: asked for one per shape each frame, the unused ones are hidden. */
class Pool<T extends THREE.Object3D> {
  private items: T[] = [];
  private used = 0;
  constructor(
    private parent: THREE.Object3D,
    private make: () => T,
  ) {}
  begin() {
    this.used = 0;
  }
  next(): T {
    let m = this.items[this.used];
    if (!m) {
      m = this.make();
      this.items.push(m);
      this.parent.add(m);
    }
    m.visible = true;
    this.used++;
    return m;
  }
  end() {
    for (let i = this.used; i < this.items.length; i++) this.items[i].visible = false;
  }
}

export class Figures {
  readonly group = new THREE.Group();
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private sphere = new THREE.SphereGeometry(1, 20, 14);
  private tubes = new Map<string, THREE.BufferGeometry>();
  private balls = new Pool(this.group, () => this.mesh(this.sphere));
  private tubePool = new Pool(this.group, () => this.mesh(this.sphere));
  private surfaces = new Map<string, THREE.Mesh>();
  private a = new THREE.Vector3();
  private b = new THREE.Vector3();
  private d = new THREE.Vector3();

  private mesh(geometry: THREE.BufferGeometry) {
    const m = new THREE.Mesh(geometry);
    m.castShadow = true;
    return m;
  }

  private material(color: string, flat = false) {
    const key = color + (flat ? "|flat" : "");
    let m = this.materials.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: flat ? 0.9 : 0.72, metalness: 0 });
      this.materials.set(key, m);
    }
    return m;
  }

  /** The side wall of a tapered capsule, one meter long, cached per pair of radii. */
  private tube(ra: number, rb: number) {
    const key = ra.toFixed(4) + "|" + rb.toFixed(4);
    let g = this.tubes.get(key);
    if (!g) {
      g = new THREE.CylinderGeometry(rb, ra, 1, 18, 1, true);
      this.tubes.set(key, g);
    }
    return g;
  }

  private ball(p: V, r: number, color: string, flat = false) {
    const m = this.balls.next();
    m.material = this.material(color, flat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.setScalar(r);
  }

  private capsule(a: V, b: V, ra: number, rb: number, color: string, flat = false) {
    this.ball(a, ra, color, flat);
    this.ball(b, rb, color, flat);
    this.a.set(a[0], a[1], a[2]);
    this.b.set(b[0], b[1], b[2]);
    const len = this.d.subVectors(this.b, this.a).length();
    if (len < 1e-5) return;
    const m = this.tubePool.next();
    m.geometry = this.tube(ra, rb);
    m.material = this.material(color, flat);
    m.position.addVectors(this.a, this.b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, this.d.multiplyScalar(1 / len));
    m.scale.set(1, len, 1);
  }

  /** A mesh whose points are rewritten every frame (torso, skirt). */
  private surface(key: string, positions: number[], colors: number[], index: number[]) {
    let m = this.surfaces.get(key);
    if (!m) {
      const g = new THREE.BufferGeometry();
      m = new THREE.Mesh(
        g,
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }),
      );
      m.castShadow = true;
      this.surfaces.set(key, m);
      this.group.add(m);
    }
    const g = m.geometry;
    const pos = g.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!pos || pos.count !== positions.length / 3) {
      g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      g.setIndex(index);
    } else {
      (pos.array as Float32Array).set(positions);
      pos.needsUpdate = true;
      const col = g.getAttribute("color") as THREE.BufferAttribute;
      (col.array as Float32Array).set(colors);
      col.needsUpdate = true;
    }
    g.computeVertexNormals();
    g.computeBoundingSphere();
    m.visible = true;
  }

  /** The torso: rings of rounded cross-sections from hips to shoulders, joined into one smooth surface. */
  private torso(s: Shape) {
    const K = 22,
      rings: any[] = s.rings,
      pos: number[] = [],
      col: number[] = [],
      idx: number[] = [],
      c = new THREE.Color();
    const f = s.fwd as V;
    for (const ring of rings) {
      const a: V = ring.a,
        b: V = ring.b,
        m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      let u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const hl = Math.hypot(u[0], u[1], u[2]) / 2 || 1e-6;
      u = u.map((x) => x / (2 * hl));
      c.set(ring.col);
      for (let k = 0; k < K; k++) {
        const th = (k / K) * Math.PI * 2,
          cs = Math.cos(th),
          sn = Math.sin(th),
          side = Math.tanh(cs * 3) * hl; // a rounded box, not a pill: softer corners
        pos.push(
          m[0] + u[0] * (side + cs * ring.r) + f[0] * sn * ring.r,
          m[1] + u[1] * (side + cs * ring.r),
          m[2] + u[2] * (side + cs * ring.r) + f[2] * sn * ring.r,
        );
        col.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < rings.length - 1; i++)
      for (let k = 0; k < K; k++) {
        const p = i * K + k,
          q = i * K + ((k + 1) % K);
        idx.push(p, q, p + K, q, q + K, p + K);
      }
    // close the bottom and the top
    for (const [ring, flip] of [
      [0, true],
      [rings.length - 1, false],
    ] as const) {
      const base = pos.length / 3,
        r = rings[ring],
        m = [(r.a[0] + r.b[0]) / 2, (r.a[1] + r.b[1]) / 2, (r.a[2] + r.b[2]) / 2];
      pos.push(m[0], m[1], m[2]);
      c.set(r.col);
      col.push(c.r, c.g, c.b);
      for (let k = 0; k < K; k++) {
        const p = ring * K + k,
          q = ring * K + ((k + 1) % K);
        flip ? idx.push(base, q, p) : idx.push(base, p, q);
      }
    }
    this.surface("torso " + s.id, pos, col, idx);
  }

  /** The skirt: the engine's panels, joined into one cloth surface per dancer. */
  private skirt(id: string, panels: Shape[], legs: Shape[]) {
    const pos: number[] = [],
      col: number[] = [],
      idx: number[] = [],
      c = new THREE.Color();
    // Cloth lies over the legs: wherever a thigh or shin would poke through, the skirt is pushed out to cover it.
    const bumps: number[][] = [];
    for (const leg of legs)
      for (let k = 0; k <= 8; k++) {
        const a = leg.a as V,
          b = leg.b as V,
          u = k / 8;
        bumps.push([
          a[0] + (b[0] - a[0]) * u,
          a[1] + (b[1] - a[1]) * u,
          a[2] + (b[2] - a[2]) * u,
          leg.wa! + (leg.wb! - leg.wa!) * u,
        ]);
      }
    const drape = (q: V, axis: V): V => {
      const dx = q[0] - axis[0],
        dz = q[2] - axis[2],
        r = Math.hypot(dx, dz) || 1e-6,
        ux = dx / r,
        uz = dz / r;
      let need = r;
      for (const p of bumps) {
        if (Math.abs(p[1] - q[1]) > 0.09) continue;
        const px = p[0] - axis[0],
          pz = p[2] - axis[2],
          along = px * ux + pz * uz,
          across = Math.abs(px * uz - pz * ux);
        if (across < p[3] + 0.05) need = Math.max(need, along + p[3] + 0.014 - across * 0.35);
      }
      return [axis[0] + ux * need, q[1], axis[2] + uz * need];
    };
    for (const p of panels) {
      const base = pos.length / 3;
      c.set(p.base ?? p.col!);
      for (const raw of p.pts as V[]) {
        const q = drape(raw, p.ctr as V);
        pos.push(q[0], q[1], q[2]);
        col.push(c.r, c.g, c.b);
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    this.surface("skirt " + id, pos, col, idx);
  }

  /** Eyes, brows, nose, mouth and ears, placed on the head so they turn with it. */
  private face(h: Shape) {
    const F = h.face,
      fp = F.fp as (f: number, s: number, y: number) => V,
      R = F.HR as number,
      skin = F.skin as string;
    const darker = "#" + new THREE.Color(skin).multiplyScalar(0.8).getHexString();
    this.ball(fp(0.16, 0, -0.47), R * 0.7, skin); // jaw
    for (const s of [-1, 1]) {
      this.ball(fp(0.9, s * 0.36, 0.05), R * 0.1, "#241C2B", true); // eye
      this.capsule(
        fp(0.93, s * 0.2, 0.33),
        fp(0.87, s * 0.54, 0.34),
        R * (F.isLead ? 0.04 : 0.026),
        R * 0.02,
        F.hair,
        true,
      ); // brow
      this.ball(fp(-0.02, s * 0.98, -0.08), R * 0.17, darker); // ear
    }
    this.ball(fp(1.0, 0, -0.2), R * 0.13, darker); // nose
    // a small smile: two short strokes meeting a little lower in the middle
    const lip = F.isLead ? "#9A6A5C" : "#B8485E";
    for (const s of [-1, 1]) this.capsule(fp(0.9, s * 0.2, -0.56), fp(0.95, 0, -0.63), R * 0.035, R * 0.04, lip, true);
  }

  /**
   * Redraw both dancers.
   * @param hide POV only: "l" or "f", the dancer whose eyes you look out of.
   */
  update(shapes: Shape[], hide: "l" | "f" | null) {
    this.balls.begin();
    this.tubePool.begin();
    for (const m of this.surfaces.values()) m.visible = false;
    const skirts = new Map<string, Shape[]>();
    const eye = hide ? (shapes.find((s) => s.t === "h" && !!s.lead === (hide === "l"))?.p as V | undefined) : undefined;
    for (const s of shapes) {
      if (s.t === "x" || s.nod || s.bar || s.part === "torso") continue; // collision-only volumes; the torso is drawn as one surface instead
      // POV: your own head, hair and neck are left out, because the camera sits inside them. The rest of your
      // body stays, so looking down you see yourself: chest, skirt, legs, feet.
      if (eye && !!s.lead === (hide === "l") && (s.t === "h" || aroundEye(s, eye))) continue;
      if (s.t === "c") this.capsule(s.a as V, s.b as V, s.wa!, s.wb!, s.col!, !!s.flat);
      else if (s.t === "o") this.ball(s.p as V, s.r!, s.col!, !!s.flat);
      else if (s.t === "h") {
        this.ball(s.p as V, s.r!, s.col!);
        if (s.face) this.face(s);
      } else if (s.t === "loft") this.torso(s);
      else if (s.t === "p" && s.skirt) (skirts.get(s.id) ?? skirts.set(s.id, []).get(s.id)!).push(s);
    }
    for (const [id, panels] of skirts)
      this.skirt(
        id,
        panels,
        shapes.filter((s) => s.id === id && (s.part === "thigh" || s.part === "shin")),
      );
    this.balls.end();
    this.tubePool.end();
  }
}

/** Is this ball or limb so close to the eye point that the camera would be inside it or right against it? */
function aroundEye(s: Shape, eye: V): boolean {
  const NEAR = 0.13;
  if (s.t === "o") return Math.hypot(s.p![0] - eye[0], s.p![1] - eye[1], s.p![2] - eye[2]) - s.r! < NEAR;
  if (s.t !== "c") return false;
  const a = s.a as V,
    b = s.b as V,
    d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
    len2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] || 1e-9;
  const u = Math.min(1, Math.max(0, ((eye[0] - a[0]) * d[0] + (eye[1] - a[1]) * d[1] + (eye[2] - a[2]) * d[2]) / len2));
  return (
    Math.hypot(a[0] + d[0] * u - eye[0], a[1] + d[1] * u - eye[1], a[2] + d[2] * u - eye[2]) - Math.max(s.wa!, s.wb!) <
    NEAR
  );
}
