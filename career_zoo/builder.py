from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from .spec import PROJECT_ROOT, write_json


TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"


def build_webapp(spec: dict[str, Any], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "assets").mkdir(exist_ok=True)
    write_json(output_dir / "test-spec.json", spec)
    for filename in ("index.html", "styles.css", "app.js", "README.md"):
        shutil.copy2(TEMPLATE_DIR / filename, output_dir / filename)
    for archetype in spec["archetypes"]:
        source = PROJECT_ROOT / archetype["asset"]
        destination = output_dir / "assets" / source.name
        shutil.copy2(source, destination)

