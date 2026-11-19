// The stage: three layers stacked on top of each other.
//   floor  (2D canvas)  grid, weight shadows, footprints, turn arcs
//   gl     (WebGL)      the two dancers, in real 3D with light and shadow
//   over   (2D canvas)  hand arrow, joined-hand rings, the POV mini map
import * as THREE from "three";
import type { Frame } from "../engine";
import { Camera } from "./camera";
import { Figures } from "./figures";
import { drawFloor, drawOverlay, type GuideInput } from "./guides";

export interface StageColors {
  floor: string;
  lead: string;
  follow: string;
  join: string;
  bg: string;
}

export class Stage {
  readonly camera = new Camera();
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private figures = new Figures();
  private sun = new THREE.DirectionalLight(0xffffff, 2.1);
  private floorCtx: CanvasRenderingContext2D;
  private overCtx: CanvasRenderingContext2D;
  width = 1;
  height = 1;

  constructor(
    private floor: HTMLCanvasElement,
    private gl: HTMLCanvasElement,
    private over: HTMLCanvasElement,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.floorCtx = floor.getContext("2d")!;
    this.overCtx = over.getContext("2d")!;

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8298, 1.25));
    this.sun.position.set(-1.6, 3.6, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -1.6;
    sc.right = sc.top = 1.6;
    sc.near = 0.5;
    sc.far = 8;
    this.sun.shadow.bias = -0.0015;
    this.scene.add(this.sun, this.sun.target);
    const fill = new THREE.DirectionalLight(0xffffff, 0.55);
    fill.position.set(2.5, 1.6, -1.5);
    this.scene.add(fill);

    // an invisible floor that only shows the shadows falling on it
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.2 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground, this.figures.group);
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    this.camera.resize(width, height);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    for (const [canvas, ctx] of [
      [this.floor, this.floorCtx],
      [this.over, this.overCtx],
    ] as const) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /** Draw one frame. */
  draw(frame: Frame, guides: GuideInput, colors: StageColors) {
    const { Pl, Pf } = frame,
      mid: [number, number] = [(Pl.c[0] + Pf.c[0]) / 2, (Pl.c[1] + Pf.c[1]) / 2];
    const head = frame.shapes.find((s) => s.t === "h" && s.lead)!;
    this.camera.update(mid, { at: head.p as number[], yawDeg: Pl.headTh, pitch: Pl.headPitch });
    // the light follows the couple so their shadow stays sharp wherever they travel
    this.sun.position.set(mid[0] - 1.6, 3.6, mid[1] + 2.2);
    this.sun.target.position.set(mid[0], 0, mid[1]);
    this.figures.update(frame.shapes, this.camera.pov);

    this.floorCtx.clearRect(0, 0, this.width, this.height);
    drawFloor(this.floorCtx, this.camera, frame, guides, colors);
    this.renderer.render(this.scene, this.camera.three);
    this.overCtx.clearRect(0, 0, this.width, this.height);
    drawOverlay(this.overCtx, this.camera, frame, guides, colors);
  }

  /** The 2D layer on top, for the real-motion mode which draws flat figures instead of 3D ones. */
  flat(): CanvasRenderingContext2D {
    this.floorCtx.clearRect(0, 0, this.width, this.height);
    this.renderer.clear();
    this.overCtx.clearRect(0, 0, this.width, this.height);
    return this.overCtx;
  }
}
