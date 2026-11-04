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
    for filename in (
        "index.html",
        "styles.css",
        "app.js",
        "world.html",
        "world.css",
        "world.js",
        "README.md",
    ):
        shutil.copy2(TEMPLATE_DIR / filename, output_dir / filename)
    for archetype in spec["archetypes"]:
        source = PROJECT_ROOT / archetype["asset"]
        destination = output_dir / "assets" / source.name
        shutil.copy2(source, destination)
    font_source = PROJECT_ROOT / "assets" / "fonts"
    if font_source.exists():
        shutil.copytree(font_source, output_dir / "assets" / "fonts", dirs_exist_ok=True)
    world_characters = PROJECT_ROOT / "assets" / "characters" / "world_characters.png"
    if world_characters.exists():
        shutil.copy2(world_characters, output_dir / "assets" / world_characters.name)
    world_intro = PROJECT_ROOT / "assets" / "characters" / "world_intro_group.png"
    if world_intro.exists():
        shutil.copy2(world_intro, output_dir / "assets" / world_intro.name)

