// The camera: an orbit view around the couple, or your own eyes (POV). "You" is the leader or the follower.
import * as THREE from "three";

export type ViewName = "side" | "you" | "top" | "pov" | "free";

/** Preset orbit angles: [yaw, pitch] in radians. */
export const VIEWS: Record<string, [number, number]> = { side: [0.62, 0.36], you: [-1.15, 0.5], top: [0, 1.35] };

export class Camera {
  readonly three = new THREE.PerspectiveCamera(40, 1, 0.05, 60);
  view: ViewName = "side";
  /** Whose side the presets and POV are seen from: leader or follower. */
  who: "l" | "f" = "l";
  yaw = 0.62;
  pitch = 0.36;
  zoom = 1;
  /** Height the orbit camera looks at, in meters. */
  lookHeight = 0.9;
  /** Point on the floor the orbit camera follows: [x, z]. */
  target: [number, number] = [0, 0];
  /** POV only: how far the head is turned / tilted by dragging. */
  povYaw = 0;
  povPitch = 0.4;
  width = 1;
  height = 1;
  private v = new THREE.Vector3();

  get pov() {
    return this.view === "pov";
  }

  setView(name: ViewName) {
    this.view = name;
    if (name === "pov") {
      this.povYaw = 0;
      this.povPitch = 0.4;
    } else if (VIEWS[name]) {
      [this.yaw, this.pitch] = VIEWS[name];
      // the follower stands at the other end of the line, so her presets are the mirror image
      if (this.who === "f") this.yaw = -this.yaw;
    }
  }

  /** Drag on the stage: orbit, or look around in POV. */
  drag(dx: number, dy: number) {
    if (this.pov) {
      this.povYaw = THREE.MathUtils.clamp(this.povYaw - dx * 0.3, -80, 80);
      this.povPitch = THREE.MathUtils.clamp(this.povPitch + dy * 0.006, -0.3, 1.2);
    } else {
      this.yaw += dx * 0.01;
      this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.008, 0.02, 1.45);
      this.view = "free";
    }
  }

  zoomBy(factor: number) {
    this.zoom = THREE.MathUtils.clamp(this.zoom * factor, 0.6, 2);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Place the camera for this frame.
   * @param couple midpoint between the dancers on the floor, [x, z]
   * @param eye POV only: your eye position, and the direction (degrees) and tilt your head faces
   */
  update(couple: [number, number], eye?: { at: number[]; yawDeg: number; pitch: number }) {
    const cam = this.three;
    this.target = [
      this.target[0] + (couple[0] - this.target[0]) * 0.08,
      this.target[1] + (couple[1] - this.target[1]) * 0.08,
    ];
    cam.aspect = this.width / this.height;
    if (this.pov && eye) {
      const a = ((eye.yawDeg + this.povYaw) * Math.PI) / 180,
        p = this.povPitch + eye.pitch;
      const f = [Math.sin(a) * Math.cos(p), -Math.sin(p), Math.cos(a) * Math.cos(p)];
      cam.fov = 92;
      cam.clearViewOffset();
      // the eyes sit in front of the middle of the head, and looking down tips the head forward: the further
      // down you look, the further the eyes come out over your chest, which is what lets you see your own feet
      const tip = Math.max(0, Math.sin(p)),
        out = 0.06 + 0.15 * tip;
      cam.position.set(eye.at[0] + Math.sin(a) * out, eye.at[1] + 0.03 - 0.05 * tip, eye.at[2] + Math.cos(a) * out);
      cam.lookAt(cam.position.x + f[0], cam.position.y + f[1], cam.position.z + f[2]);
    } else {
      const D = 3.4,
        cp = Math.cos(this.pitch),
        sp = Math.sin(this.pitch);
      cam.fov = (2 * Math.atan(0.5 / (1.28 * this.zoom)) * 180) / Math.PI;
      // the couple sits a little below the middle of the picture, leaving room for raised arms
      cam.setViewOffset(this.width, this.height, 0, -0.1 * this.height, this.width, this.height);
      cam.position.set(
        this.target[0] + D * cp * Math.sin(this.yaw),
        this.lookHeight + D * sp,
        this.target[1] + D * cp * Math.cos(this.yaw),
      );
      cam.lookAt(this.target[0], this.lookHeight, this.target[1]);
    }
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }

  /** World point (meters) -> [x, y] in stage pixels, plus the distance in front of the camera (<= 0 means behind it). */
  project(p: number[]): [number, number, number] {
    const v = this.v.set(p[0], p[1], p[2]).applyMatrix4(this.three.matrixWorldInverse),
      depth = -v.z;
    if (depth < 0.06) return [0, 0, -1];
    v.applyMatrix4(this.three.projectionMatrix);
    return [(v.x * 0.5 + 0.5) * this.width, (1 - (v.y * 0.5 + 0.5)) * this.height, depth];
  }

  /** How many pixels one meter covers at the given distance from the camera. */
  pixelsPerMeter(depth: number) {
    return this.height / (2 * Math.tan((this.three.fov * Math.PI) / 360) * depth);
  }
}
