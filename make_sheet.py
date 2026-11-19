#!/usr/bin/env python3
"""
Turn a video (or a part of it) into contact sheets: grids of small frames with
timestamps. Upload the sheets to Claude so it can see what happens in the video.

Needs:  pip install opencv-python   (already installed with ultralytics)

Overview of a whole video, one frame every 20 seconds:
    python make_sheet.py "course.mp4" --every 20

Close look at one move, 3 frames per second from 2:05 to 2:20:
    python make_sheet.py "course.mp4" --start 125 --end 140 --every 0.33

Result: JPG files named like course_sheet_0125s_01.jpg next to the video.
"""
import argparse
import os
import sys


def stamp(t):
    m, s = divmod(t, 60)
    h, m = divmod(int(m), 60)
    return f"{h}:{m:02d}:{s:04.1f}" if h else f"{m}:{s:04.1f}"


def main():
    ap = argparse.ArgumentParser(description="Make timestamped contact sheets from a video.")
    ap.add_argument("video")
    ap.add_argument("--start", type=float, default=0, help="start time in seconds")
    ap.add_argument("--end", type=float, default=None, help="end time in seconds")
    ap.add_argument("--every", type=float, default=20, help="seconds between frames")
    ap.add_argument("--cols", type=int, default=6, help="frames per row")
    ap.add_argument("--rows", type=int, default=5, help="rows per sheet")
    ap.add_argument("--width", type=int, default=320, help="width of each small frame")
    ap.add_argument("--crop", default=None, help="keep only part of the picture: left,top,right,bottom as fractions, e.g. 0.25,0.08,0.8,0.95")
    ap.add_argument("--out", default=None, help="folder for the sheets (default: next to the video)")
    args = ap.parse_args()

    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("Missing package. Run:  pip install opencv-python")
    if not os.path.exists(args.video):
        sys.exit(f"File not found: {args.video}")

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        sys.exit(f"Could not open video: {args.video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    dur = total / fps if total else None
    end = args.end if args.end is not None else (dur or 1e9)
    if dur:
        end = min(end, dur)

    base = os.path.splitext(args.video)[0]
    if args.out:
        os.makedirs(args.out, exist_ok=True)
        base = os.path.join(args.out, "sheet")
    crop = [float(x) for x in args.crop.split(",")] if args.crop else None
    per_sheet = args.cols * args.rows
    tiles, saved, t, sheet_no = [], [], args.start, 0
    seek = args.every >= 1.0  # jump for sparse sampling, read through for dense

    def flush():
        nonlocal tiles, sheet_no
        if not tiles:
            return
        sheet_no += 1
        h, w = tiles[0].shape[:2]
        rows = (len(tiles) + args.cols - 1) // args.cols
        sheet = np.full((rows * h, args.cols * w, 3), 255, dtype=np.uint8)
        for i, tile in enumerate(tiles):
            r, c = divmod(i, args.cols)
            sheet[r * h:(r + 1) * h, c * w:(c + 1) * w] = tile
        out = f"{base}_sheet_{int(args.start):04d}s_{sheet_no:02d}.jpg"
        cv2.imwrite(out, sheet, [cv2.IMWRITE_JPEG_QUALITY, 82])
        saved.append(out)
        tiles = []

    if not seek:
        cap.set(cv2.CAP_PROP_POS_MSEC, args.start * 1000)
    next_t = args.start
    while next_t <= end:
        if seek:
            cap.set(cv2.CAP_PROP_POS_MSEC, next_t * 1000)
            ok, frame = cap.read()
            cur = next_t
        else:
            ok, frame = cap.read()
            cur = (cap.get(cv2.CAP_PROP_POS_MSEC) or 0) / 1000
            if ok and cur + 1e-3 < next_t:
                continue
        if not ok:
            break
        if crop:
            fh, fw = frame.shape[:2]
            frame = frame[int(crop[1] * fh):int(crop[3] * fh), int(crop[0] * fw):int(crop[2] * fw)]
        h, w = frame.shape[:2]
        tile = cv2.resize(frame, (args.width, max(1, round(h * args.width / w))), interpolation=cv2.INTER_AREA)
        label = stamp(cur)
        cv2.rectangle(tile, (0, 0), (len(label) * 11 + 10, 24), (0, 0, 0), -1)
        cv2.putText(tile, label, (5, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1, cv2.LINE_AA)
        tiles.append(tile)
        if len(tiles) == per_sheet:
            flush()
        next_t += args.every
    flush()
    cap.release()

    if not saved:
        sys.exit("No frames were read. Check --start and --end.")
    print(f"Saved {len(saved)} sheet(s):")
    for s in saved:
        print("  " + s)
    if dur:
        print(f"Video length: {stamp(dur)}")


if __name__ == "__main__":
    main()
