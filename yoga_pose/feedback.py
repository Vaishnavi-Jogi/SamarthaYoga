from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Set

import numpy as np

from yoga_pose.utils.geometry import joint_angle, torso_angle
from yoga_pose.asanas.knowledge import KnowledgeBase

Point3 = Tuple[float, float, float]


@dataclass
class Feedback:
    asana: Optional[str]
    messages: List[str]
    score: float
    highlight_joints: List[str]


class FeedbackEngine:
    def __init__(self) -> None:
        self.kb = KnowledgeBase()

    def analyze(self, asana: Optional[str], lm: Dict[str, Point3]) -> Feedback:
        msgs: List[str] = []
        score_components: List[float] = []
        issues: Set[str] = set()
        # Helper to 2D
        def p2(k: str) -> Tuple[float, float]:
            x, y, _ = lm[k]
            return (x, y)

        def add(condition: bool, good: str, bad: str, mark: Optional[List[str]] = None) -> None:
            if condition:
                score_components.append(1.0)
            else:
                score_components.append(0.0)
                msgs.append(bad)
                if mark:
                    issues.update(mark)

        # Generic alignment cues
        if all(k in lm for k in ("l_shoulder", "r_shoulder", "l_hip", "r_hip")):
            t_angle = torso_angle(p2("l_shoulder"), p2("r_shoulder"), p2("l_hip"), p2("r_hip"))
            add(
                t_angle <= 10.0,
                "Torso level",
                "Lengthen both sides of torso; keep chest open.",
                ["l_shoulder", "r_shoulder"],
            )

        if asana == "Virabhadrasana II":
            if all(k in lm for k in ("l_hip", "l_knee", "l_ankle", "r_hip", "r_knee", "r_ankle")):
                lk = joint_angle(p2("l_hip"), p2("l_knee"), p2("l_ankle"))
                rk = joint_angle(p2("r_hip"), p2("r_knee"), p2("r_ankle"))
                # front knee approx 90, back straight
                if not np.isnan(lk) and not np.isnan(rk):
                    front_left = lk < rk
                    front = lk if front_left else rk
                    back = rk if front_left else lk
                    add(
                        65 <= front <= 115,
                        "Front knee near 90",
                        "Bend front knee to stack over ankle.",
                        ["l_knee"] if front_left else ["r_knee"],
                    )
                    add(
                        back >= 165,
                        "Back leg straight",
                        "Straighten back leg; lift inner arch.",
                        ["r_knee"] if front_left else ["l_knee"],
                    )
            if all(k in lm for k in ("l_elbow", "l_shoulder", "l_wrist", "r_elbow", "r_shoulder", "r_wrist")):
                le = joint_angle(p2("l_shoulder"), p2("l_elbow"), p2("l_wrist"))
                re = joint_angle(p2("r_shoulder"), p2("r_elbow"), p2("r_wrist"))
                add(
                    le >= 165 and re >= 165,
                    "Arms straight",
                    "Extend through fingertips; keep arms parallel to floor.",
                    ["l_elbow", "r_elbow"],
                )

        elif asana == "Trikonasana":
            if all(k in lm for k in ("l_knee", "l_ankle", "l_hip", "r_knee", "r_ankle", "r_hip")):
                lk = joint_angle(p2("l_hip"), p2("l_knee"), p2("l_ankle"))
                rk = joint_angle(p2("r_hip"), p2("r_knee"), p2("r_ankle"))
                if not np.isnan(lk) and not np.isnan(rk):
                    add(
                        lk >= 165 and rk >= 165,
                        "Legs straight",
                        "Lengthen both legs; avoid hyperextension in knees.",
                        ["l_knee", "r_knee"],
                    )
        else:
            msgs.append("Hold a clear shape; stand tall and breathe evenly.")

        # Knowledge-based cues
        if asana:
            info = self.kb.get(asana)
            if info:
                align = info.get("alignment", [])
                mistakes = info.get("mistakes", [])
                effects = info.get("effects", [])
                # Add one alignment suggestion and one common mistake reminder
                if align:
                    msgs.append(f"Tip: {align[0]}")
                if mistakes:
                    msgs.append(f"Avoid: {mistakes[0]}")
                if effects:
                    msgs.append(f"Effect: {effects[0]}")

        score = float(np.mean(score_components)) if score_components else 0.0
        return Feedback(asana=asana, messages=msgs, score=score, highlight_joints=sorted(issues))
