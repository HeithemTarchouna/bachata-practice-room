#!/usr/bin/env python3
"""
Extract the two dancers' poses from a video, for the Bachata practice room.

Setup (once):
    pip install ultralytics opencv-python

Run:
    python extract_poses.py lesson.mp4
    python extract_poses.py lesson.mp4 --start 94 --end 104      # only 1:34 to 1:44
    python extract_poses.py lesson.mp4 --model yolov8x-pose.pt   # slower, most accurate
    python extract_poses.py lesson.mp4 --model yolov8n-pose.pt   # faster, less accurate

Result:
    lesson.poses.json  ->  load it in the practice room with "Load motion file".

The first run downloads the pose model (about 50 MB). Everything runs on your
own computer; the video is not uploaded anywhere.

Tips for good results:
  - Film from the side or at a slight angle, both dancers fully in frame.
  - Good light, camera not moving.
  - Keep clips short (10 to 30 seconds per move) with --start and --end.
"""
import argparse
import json
import os
import sys


def centroid(kp):
    pts = [(x, y) for x, y, c in kp if c > 0.3]
    if not pts:
        return None
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


def dist(a, b):
    if a is None or b is None:
        return 1e9
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def main():
    ap = argparse.ArgumentParser(description="Extract two dancers' poses from a video.")
    ap.add_argument("video")
    ap.add_argument("-o", "--out", help="output file (default: <video>.poses.json)")
    ap.add_argument("--model", default="yolov8m-pose.pt", help="ultralytics pose model")
    ap.add_argument("--fps", type=float, default=15, help="poses per second to keep")
    ap.add_argument("--start", type=float, default=0, help="start time in seconds")
    ap.add_argument("--end", type=float, default=None, help="end time in seconds")
    ap.add_argument("--conf", type=float, default=0.2, help="detection confidence (lower finds more, default 0.2)")
    ap.add_argument("--imgsz", type=int, default=960, help="analysis size in pixels (bigger is slower, more accurate)")
    args = ap.parse_args()

    try:
        import cv2
        from ultralytics import YOLO
    except ImportError:
        sys.exit("Missing packages. Run:  pip install ultralytics opencv-python")

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        sys.exit(f"Could not open video: {args.video}")
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(1, round(src_fps / args.fps))
    out_fps = src_fps / step
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    model = YOLO(args.model)
    frames = []
    prev = [None, None]  # last known centre of dancer A and dancer B
    width = height = None
    i = -1
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        i += 1
        t = i / src_fps
        if t < args.start or i % step:
            continue
        if args.end is not None and t > args.end:
            break
        if width is None:
            height, width = frame.shape[:2]

        res = model.predict(frame, conf=args.conf, imgsz=args.imgsz, verbose=False)[0]
        cands = []
        if res.keypoints is not None and res.boxes is not None and len(res.boxes):
            xy = res.keypoints.xy.cpu().numpy()
            cf = res.keypoints.conf
            cf = cf.cpu().numpy() if cf is not None else None
            wh = res.boxes.xywh.cpu().numpy()
            # keep the two biggest people in the frame: the dancers
            order = sorted(range(len(xy)), key=lambda k: -wh[k][2] * wh[k][3])[:2]
            for k in order:
                kp = [
                    [int(round(float(x))), int(round(float(y))), round(float(cf[k][j]) if cf is not None else 1.0, 2)]
                    for j, (x, y) in enumerate(xy[k])
                ]
                cands.append(kp)

        # keep dancer A and dancer B consistent from frame to frame
        slots = [None, None]
        cs = [centroid(k) for k in cands]
        if len(cands) == 2:
            if prev[0] is None and prev[1] is None:
                a, b = (0, 1) if (cs[0] or (0, 0))[0] <= (cs[1] or (0, 0))[0] else (1, 0)
            else:
                straight = dist(cs[0], prev[0]) + dist(cs[1], prev[1])
                swapped = dist(cs[0], prev[1]) + dist(cs[1], prev[0])
                a, b = (0, 1) if straight <= swapped else (1, 0)
            slots = [cands[a], cands[b]]
        elif len(cands) == 1:
            s = 0 if dist(cs[0], prev[0]) <= dist(cs[0], prev[1]) else 1
            slots[s] = cands[0]
        for s in (0, 1):
            if slots[s] is not None:
                c = centroid(slots[s])
                if c is not None:
                    prev[s] = c

        frames.append({"t": round(t - args.start, 3), "p": slots})
        if len(frames) % 30 == 0:
            done = f"{100 * i / total:.0f}%" if total else f"{t:.1f}s"
            print(f"  {done}  ({len(frames)} poses)", flush=True)

    cap.release()
    if not frames:
        sys.exit("No frames were read. Check --start and --end.")

    out = args.out or os.path.splitext(args.video)[0] + ".poses.json"
    with open(out, "w") as f:
        json.dump(
            {
                "version": 1,
                "source": os.path.basename(args.video),
                "fps": round(out_fps, 3),
                "width": width,
                "height": height,
                "frames": frames,
            },
            f,
            separators=(",", ":"),
        )
    both = sum(1 for fr in frames if fr["p"][0] and fr["p"][1])
    print(f"Saved {out}: {len(frames)} poses, both dancers found in {100 * both / len(frames):.0f}% of them.")


if __name__ == "__main__":
    main()
