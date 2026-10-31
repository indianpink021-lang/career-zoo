from __future__ import annotations

import json
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_RUN = PROJECT_ROOT / "runs" / "2026-10-31-career-zoo"


def read_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def compile_spec(run_dir: Path = DEFAULT_RUN) -> dict[str, Any]:
    scoring = read_json(run_dir / "round-03-scoring.json")
    archetype_round = read_json(run_dir / "round-04-archetypes.json")
    question_round = read_json(run_dir / "round-05-questions.json")
    result_round = read_json(run_dir / "round-06-results.json")
    visual = read_json(run_dir / "round-08-visual-contract.json")

    result_by_id = {item["id"]: item for item in result_round["results"]}
    archetypes: list[dict[str, Any]] = []
    for base in archetype_round["archetypes"]:
        copy = dict(base)
        copy.update(result_by_id[base["id"]])
        copy["asset"] = visual["assets"]["characters"][base["id"]]
        copy["accent"] = visual["visual_direction"]["accent_colors"][base["id"]]
        archetypes.append(copy)

    profile = question_round["profile_question"]
    current_field_labels = {item["id"]: item["label"] for item in profile["options"]}

    return {
        "meta": {
            "title": "나의 다음 직업 찾기",
            "subtitle": "지금 일은 잠깐 내려두고, 다음 직업의 동물을 만나보세요.",
            "version": "0.1.0",
            "runId": run_dir.name,
            "questionCount": 9,
            "estimatedMinutes": 3,
        },
        "dimensions": scoring["dimensions"],
        "scoring": scoring["scoring"],
        "profileQuestions": [profile],
        "currentFieldLabels": current_field_labels,
        "transferableSkillMap": result_round["current_field_skill_map"],
        "bridgeTemplate": result_round["bridge_template"],
        "scoredQuestions": question_round["scored_questions"],
        "archetypes": archetypes,
        "resultCard": visual["result_card"],
        "typography": visual["typography"],
        "accessibility": visual["accessibility"],
        "disclaimer": result_round["disclaimer"],
    }

