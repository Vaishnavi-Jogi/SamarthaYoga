from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Tuple

import cv2
import numpy as np

Point3 = Tuple[float, float, float]

# Pairs to draw skeleton
SKELETON = [
    ("l_shoulder", "r_shoulder"),
    ("l_shoulder", "l_elbow"),
    ("l_elbow", "l_wrist"),
    ("r_shoulder", "r_elbow"),
    ("r_elbow", "r_wrist"),
    ("l_hip", "r_hip"),
    ("l_shoulder", "l_hip"),
    ("r_shoulder", "r_hip"),
    ("l_hip", "l_knee"),
    ("r_hip", "r_knee"),
    ("l_knee", "l_ankle"),
    ("r_knee", "r_ankle"),
]


def draw_skeleton(frame: np.ndarray, lm: Dict[str, Point3], color=(0, 255, 0), highlight: Optional[List[str]] = None) -> None:
    for a, b in SKELETON:
        if a in lm and b in lm:
            ax, ay, _ = lm[a]
            bx, by, _ = lm[b]
            cv2.line(frame, (int(ax), int(ay)), (int(bx), int(by)), color, 2)
    highlights = set(highlight or [])
    for k, (x, y, _z) in lm.items():
        col = (0, 0, 255) if k in highlights else (0, 255, 255)
        cv2.circle(frame, (int(x), int(y)), 5 if k in highlights else 4, col, -1)


def overlay_feedback(frame: np.ndarray, lines: List[str], color=(0, 0, 255)) -> None:
    y = 30
    for line in lines[:5]:
        cv2.putText(frame, line, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA)
        y += 24
