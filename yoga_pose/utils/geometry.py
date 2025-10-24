from __future__ import annotations

from typing import Dict, Iterable, Mapping, Optional, Sequence, Tuple

import numpy as np

Point = Tuple[float, float]


def vector(a: Point, b: Point) -> np.ndarray:
    return np.array([b[0] - a[0], b[1] - a[1]], dtype=float)


def length(v: np.ndarray) -> float:
    return float(np.linalg.norm(v))


def angle_between(v1: np.ndarray, v2: np.ndarray) -> float:
    """Return angle in degrees between vectors v1->v2 (0..180)."""
    denom = (np.linalg.norm(v1) * np.linalg.norm(v2))
    if denom == 0:
        return float("nan")
    cos_theta = np.clip(np.dot(v1, v2) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_theta)))


def joint_angle(a: Point, b: Point, c: Point) -> float:
    """Angle at b formed by a-b-c in degrees (0..180)."""
    v1 = vector(b, a)
    v2 = vector(b, c)
    return angle_between(v1, v2)


def slope(a: Point, b: Point) -> float:
    if b[0] == a[0]:
        return float("inf")
    return (b[1] - a[1]) / (b[0] - a[0])


def distance(a: Point, b: Point) -> float:
    return float(np.hypot(b[0] - a[0], b[1] - a[1]))


def normalize_angle(angle_deg: float) -> float:
    """Clamp angle into [0, 180]."""
    if np.isnan(angle_deg):
        return angle_deg
    angle_deg = angle_deg % 360
    if angle_deg > 180:
        angle_deg = 360 - angle_deg
    return angle_deg


def torso_angle(l_shoulder: Point, r_shoulder: Point, l_hip: Point, r_hip: Point) -> float:
    """Angle of shoulders-hips line vs horizontal; 0 is level."""
    mid_sh = ((l_shoulder[0] + r_shoulder[0]) / 2.0, (l_shoulder[1] + r_shoulder[1]) / 2.0)
    mid_hip = ((l_hip[0] + r_hip[0]) / 2.0, (l_hip[1] + r_hip[1]) / 2.0)
    v = vector(mid_hip, mid_sh)
    # angle between v and horizontal right vector
    return normalize_angle(angle_between(v, np.array([1.0, 0.0])))


def hip_width(l_hip: Point, r_hip: Point) -> float:
    return distance(l_hip, r_hip)


def foot_width(l_ankle: Point, r_ankle: Point) -> float:
    return distance(l_ankle, r_ankle)


def side_of_body(l_shoulder: Point, r_shoulder: Point) -> str:
    return "left" if l_shoulder[0] < r_shoulder[0] else "right"
