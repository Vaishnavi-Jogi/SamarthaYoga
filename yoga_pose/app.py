from __future__ import annotations

import argparse
from typing import Optional

import cv2
import numpy as np

from yoga_pose.pose import PoseDetector
from yoga_pose.asanas.classifier import AsanaClassifier
from yoga_pose.feedback import FeedbackEngine
from yoga_pose.viz import draw_skeleton, overlay_feedback

try:
    import pyttsx3
except Exception:
    pyttsx3 = None  # type: ignore


def maybe_tts(text: str, enabled: bool) -> None:
    if not enabled or pyttsx3 is None:
        return
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception:
        pass


def run(source: int | str, tts: bool = False) -> None:
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video source")

    detector = PoseDetector()
    classifier = AsanaClassifier()
    feedback = FeedbackEngine()

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        lm = detector.process(frame)
        asana_name: Optional[str] = None
        lines: list[str] = []
        if lm:
            draw_skeleton(frame, lm)
            result = classifier.classify(lm)
            asana_name = result.name
            fb = feedback.analyze(asana_name, lm)
            if asana_name:
                lines.append(f"Asana: {asana_name} ({result.confidence:.2f}) | Score: {fb.score:.2f}")
            else:
                lines.append(f"Asana: Unknown ({result.confidence:.2f}) | Score: {fb.score:.2f}")
            lines.extend(fb.messages)
            if fb.messages:
                maybe_tts(fb.messages[0], tts)
            # redraw with highlights to emphasize misaligned joints
            if fb.highlight_joints:
                draw_skeleton(frame, lm, highlight=fb.highlight_joints)
        else:
            lines.append("Pose not detected. Step into frame and stand tall.")
        overlay_feedback(frame, lines)
        cv2.imshow("Yoga Pose Feedback", frame)
        key = cv2.waitKey(1) & 0xFF
        if key in (27, ord('q')):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=0, help="Webcam index or path to video file")
    parser.add_argument("--tts", action="store_true", help="Enable text-to-speech guidance")
    args = parser.parse_args()
    src: int | str
    try:
        src = int(args.source)
    except ValueError:
        src = args.source
    run(src, tts=bool(args.tts))
