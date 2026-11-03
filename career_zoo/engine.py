from __future__ import annotations

import itertools
import math
import random
from collections import Counter
from typing import Any, Iterable


def _option_lookup(spec: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        option["id"]: option
        for question in spec["scoredQuestions"]
        for option in question["options"]
    }


def choose_career_paths(archetype: dict[str, Any], signals: dict[str, int]) -> list[dict[str, str]]:
    labels = {
        "stable": "전문 실무",
        "independent": "독립·사업",
        "public": "대중·콘텐츠",
        "leadership": "리더십",
    }
    eligible = sorted(
        (
            ("independent", signals["independence"]),
            ("public", signals["visibility"]),
            ("leadership", signals["leadership"]),
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    modes = ["stable", *(mode for mode, score in eligible if score >= 2)][:3]
    while len(modes) < 3:
        modes.append("stable")
    used: Counter[str] = Counter()
    careers: list[dict[str, str]] = []
    for mode in modes:
        choices = archetype["career_tracks"][mode]
        index = used[mode]
        used[mode] += 1
        careers.append({"mode": mode, "label": labels[mode], "title": choices[index % len(choices)]})
    return careers


def score_answers(spec: dict[str, Any], answer_ids: Iterable[str]) -> dict[str, Any]:
    answers = list(answer_ids)
    questions = spec["scoredQuestions"]
    if len(answers) != len(questions):
        raise ValueError(f"점수 응답은 {len(questions)}개여야 합니다: {len(answers)}개 입력됨")

    lookup = _option_lookup(spec)
    archetypes = spec["archetypes"]
    dimensions = [item["id"] for item in spec["dimensions"]]
    appearances = Counter(
        option["archetype"]
        for question in questions
        for option in question["options"]
    )
    votes: Counter[str] = Counter()
    totals = {dimension: 0 for dimension in dimensions}
    signals = {"independence": 0, "leadership": 0, "visibility": 0}

    for answer_id in answers:
        if answer_id not in lookup:
            raise ValueError(f"알 수 없는 선택지입니다: {answer_id}")
        option = lookup[answer_id]
        votes[option["archetype"]] += 1
        for dimension in dimensions:
            totals[dimension] += option["weights"][dimension]
        for signal, value in option.get("signals", {}).items():
            signals[signal] += value

    normalized = {
        item["id"]: votes[item["id"]] / appearances[item["id"]]
        for item in archetypes
    }
    best_value = max(normalized.values())
    candidates = [item for item in archetypes if math.isclose(normalized[item["id"]], best_value)]
    averages = {dimension: totals[dimension] / len(answers) for dimension in dimensions}

    if len(candidates) > 1:
        distances = {
            item["id"]: sum(
                (averages[dimension] - item["vector"][dimension]) ** 2
                for dimension in dimensions
            )
            for item in candidates
        }
        best_distance = min(distances.values())
        candidates = [item for item in candidates if math.isclose(distances[item["id"]], best_distance)]

    winner = candidates[0]
    strongest = max(dimensions, key=lambda dimension: abs(averages[dimension]))
    dimension = next(item for item in spec["dimensions"] if item["id"] == strongest)
    secondary = dimension["positive"] if averages[strongest] >= 0 else dimension["negative"]

    return {
        "archetype": winner["id"],
        "secondary": secondary,
        "dimensionAverages": averages,
        "normalizedVotes": normalized,
        "signals": signals,
        "careers": choose_career_paths(winner, signals),
    }


def simulate_distribution(
    spec: dict[str, Any], samples: int | None = None, seed: int = 42
) -> dict[str, Any]:
    option_sets = [[option["id"] for option in question["options"]] for question in spec["scoredQuestions"]]
    if samples is None:
        combinations = itertools.product(*option_sets)
        total = math.prod(len(options) for options in option_sets)
        method = "exhaustive"
    else:
        rng = random.Random(seed)
        combinations = ([rng.choice(options) for options in option_sets] for _ in range(samples))
        total = samples
        method = "random"

    counts: Counter[str] = Counter()
    for combination in combinations:
        counts[score_answers(spec, combination)["archetype"]] += 1

    return {
        "method": method,
        "total": total,
        "seed": seed if samples is not None else None,
        "distribution": {
            item["id"]: {
                "name": item["name"],
                "count": counts[item["id"]],
                "percent": round(counts[item["id"]] * 100 / total, 2),
            }
            for item in spec["archetypes"]
        },
    }

