from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, Tuple

import numpy as np

from yoga_pose.utils.geometry import joint_angle, normalize_angle

Point3 = Tuple[float, float, float]


@dataclass
class AsanaResult:
    name: Optional[str]
    confidence: float
    metrics: Dict[str, float]


class AsanaClassifier:
    """Heuristic classifier for a subset of standing asanas.

    Currently supports Trikonasana (Triangle) and Virabhadrasana II (Warrior II).
    """

    def __init__(self) -> None:
        pass

    def classify(self, lm: Dict[str, Point3]) -> AsanaResult:
        metrics: Dict[str, float] = {}
        # Required points
        req = [
            "l_shoulder",
            "r_shoulder",
            "l_elbow",
            "r_elbow",
            "l_wrist",
            "r_wrist",
            "l_hip",
            "r_hip",
            "l_knee",
            "r_knee",
            "l_ankle",
            "r_ankle",
        ]
        if not all(p in lm for p in req):
            return AsanaResult(name=None, confidence=0.0, metrics={})

        # Project to 2D for angle computations
        def p2(k: str) -> Tuple[float, float]:
            x, y, _ = lm[k]
            return (x, y)

        # Compute elbow extension (Warrior II arms horizon), knee angles, hip angles
        left_elbow = joint_angle(p2("l_shoulder"), p2("l_elbow"), p2("l_wrist"))
        right_elbow = joint_angle(p2("r_shoulder"), p2("r_elbow"), p2("r_wrist"))
        left_knee = joint_angle(p2("l_hip"), p2("l_knee"), p2("l_ankle"))
        right_knee = joint_angle(p2("r_hip"), p2("r_knee"), p2("r_ankle"))
        metrics.update(
            {
                "left_elbow": float(left_elbow),
                "right_elbow": float(right_elbow),
                "left_knee": float(left_knee),
                "right_knee": float(right_knee),
            }
        )

        # Trikonasana: front knee straight (~175-180), back knee straight; torso inclined; arms vertical and horizontal alignment
        tri_score = 0.0
        tri_components = 0
        for angle in (left_knee, right_knee):
            if not np.isnan(angle):
                tri_components += 1
                tri_score += 1.0 if angle >= 165 else 0.0

        # Virabhadrasana II: front knee ~90, back leg straight, both arms ~180 straight
        warr_score = 0.0
        warr_components = 0
        # Arms straight
        for angle in (left_elbow, right_elbow):
            if not np.isnan(angle):
                warr_components += 1
                warr_score += 1.0 if angle >= 165 else 0.0
        # Identify which knee is more bent as front knee
        if not np.isnan(left_knee) and not np.isnan(right_knee):
            front = "left" if left_knee < right_knee else "right"
            front_knee = left_knee if front == "left" else right_knee
            back_knee = right_knee if front == "left" else left_knee
            warr_components += 2
            # front ~90 +/- 25 deg
            warr_score += 1.0 if 65 <= front_knee <= 115 else 0.0
            # back straight
            warr_score += 1.0 if back_knee >= 165 else 0.0

        tri_conf = tri_score / max(tri_components, 1)
        warr_conf = warr_score / max(warr_components, 1)

        if warr_conf > tri_conf and warr_conf >= 0.6:
            return AsanaResult("Virabhadrasana II", warr_conf, metrics)
        if tri_conf >= 0.6:
            return AsanaResult("Trikonasana", tri_conf, metrics)
        return AsanaResult(None, max(tri_conf, warr_conf), metrics)
