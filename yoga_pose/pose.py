from typing import Dict, List, Optional, Tuple

import numpy as np

try:
    import mediapipe as mp
except Exception as exc:  # pragma: no cover
    mp = None  # type: ignore


Landmark = Tuple[float, float, float]


class PoseDetector:
    """
    Thin wrapper around MediaPipe Pose.
    Returns landmarks normalized to image size and visibility thresholded.
    """

    def __init__(
        self,
        static_image_mode: bool = False,
        model_complexity: int = 1,
        enable_segmentation: bool = False,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        visibility_threshold: float = 0.5,
    ) -> None:
        if mp is None:
            raise RuntimeError("mediapipe is not installed; please install dependencies")
        self._mp_pose = mp.solutions.pose
        self._pose = self._mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            enable_segmentation=enable_segmentation,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        self.visibility_threshold = visibility_threshold

    def process(self, frame_bgr: np.ndarray) -> Optional[Dict[str, Landmark]]:
        """Process a BGR frame and return dictionary of key landmarks.

        Returns None when pose not confidently detected.
        """
        if frame_bgr is None or frame_bgr.size == 0:
            return None
        image_height, image_width = frame_bgr.shape[:2]
        # Convert to RGB for mediapipe
        rgb = frame_bgr[:, :, ::-1]
        results = self._pose.process(rgb)
        if not results.pose_landmarks:
            return None
        lm = results.pose_landmarks.landmark
        # Build map for a subset used commonly in yoga analysis
        idx = self._mp_pose.PoseLandmark

        def ok(i: int) -> bool:
            return lm[i].visibility >= self.visibility_threshold

        def pack(i: int) -> Landmark:
            return (lm[i].x * image_width, lm[i].y * image_height, lm[i].z)

        required = [
            idx.NOSE,
            idx.LEFT_SHOULDER,
            idx.RIGHT_SHOULDER,
            idx.LEFT_ELBOW,
            idx.RIGHT_ELBOW,
            idx.LEFT_WRIST,
            idx.RIGHT_WRIST,
            idx.LEFT_HIP,
            idx.RIGHT_HIP,
            idx.LEFT_KNEE,
            idx.RIGHT_KNEE,
            idx.LEFT_ANKLE,
            idx.RIGHT_ANKLE,
        ]
        # If hips and shoulders missing, reject
        if not (ok(idx.LEFT_SHOULDER) and ok(idx.RIGHT_SHOULDER) and ok(idx.LEFT_HIP) and ok(idx.RIGHT_HIP)):
            return None

        names = {
            "nose": idx.NOSE,
            "l_shoulder": idx.LEFT_SHOULDER,
            "r_shoulder": idx.RIGHT_SHOULDER,
            "l_elbow": idx.LEFT_ELBOW,
            "r_elbow": idx.RIGHT_ELBOW,
            "l_wrist": idx.LEFT_WRIST,
            "r_wrist": idx.RIGHT_WRIST,
            "l_hip": idx.LEFT_HIP,
            "r_hip": idx.RIGHT_HIP,
            "l_knee": idx.LEFT_KNEE,
            "r_knee": idx.RIGHT_KNEE,
            "l_ankle": idx.LEFT_ANKLE,
            "r_ankle": idx.RIGHT_ANKLE,
        }
        out: Dict[str, Landmark] = {}
        for k, v in names.items():
            if ok(v):
                out[k] = pack(v)
        if len(out) < 8:  # insufficient points
            return None
        return out
