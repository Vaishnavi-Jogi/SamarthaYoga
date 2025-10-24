from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

_DEFAULT = {
    "Trikonasana": {
        "alignment": [
            "Keep both legs straight; lengthen both sides of the torso.",
            "Stack shoulders; top arm vertical over bottom arm.",
        ],
        "mistakes": [
            "Collapsing the bottom side waist; hyperextending the front knee.",
            "Letting the chest face the floor instead of opening to the side.",
        ],
        "effects": [
            "Stretches hamstrings and groins; tones legs and core.",
        ],
    },
    "Virabhadrasana II": {
        "alignment": [
            "Front knee over ankle; back leg straight and strong.",
            "Arms extend parallel to the floor; gaze over front hand.",
        ],
        "mistakes": [
            "Front knee collapsing inward; slumping shoulders.",
            "Back foot collapsing; pelvis not neutral.",
        ],
        "effects": [
            "Builds leg strength and stability; opens hips and chest.",
        ],
    },
}


class KnowledgeBase:
    def __init__(self, path: Optional[str] = None) -> None:
        self._data: Dict[str, Dict[str, Any]] = {}
        if path is not None and Path(path).exists():
            try:
                self._data = json.loads(Path(path).read_text())
            except Exception:
                self._data = _DEFAULT
        else:
            self._data = _DEFAULT

    def get(self, asana: str) -> Optional[Dict[str, Any]]:
        return self._data.get(asana)
