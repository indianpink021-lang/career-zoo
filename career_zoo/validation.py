from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any


SENSITIVE_KEYS = {"gender", "sex", "mbti", "age", "major", "name", "email", "company"}


def validate_spec(spec: dict[str, Any], project_root: Path) -> list[str]:
    errors: list[str] = []
    dimensions = [item["id"] for item in spec.get("dimensions", [])]
    archetypes = spec.get("archetypes", [])
    archetype_ids = [item["id"] for item in archetypes]
    questions = spec.get("scoredQuestions", [])
    profiles = spec.get("profileQuestions", [])

    if len(dimensions) != 5:
        errors.append("성향 차원은 정확히 5개여야 합니다.")
    if len(archetypes) != 6 or len(set(archetype_ids)) != 6:
        errors.append("서로 다른 결과 캐릭터가 정확히 6개여야 합니다.")
    if len(profiles) + len(questions) > 10:
        errors.append("전체 질문 수는 10개 이하여야 합니다.")
    if len(questions) != 8:
        errors.append("점수 질문은 정확히 8개여야 합니다.")

    profile_ids = {item.get("id", "").lower() for item in profiles}
    forbidden = sorted(profile_ids & SENSITIVE_KEYS)
    if forbidden:
        errors.append(f"민감한 프로필 질문이 포함되었습니다: {', '.join(forbidden)}")

    appearances: Counter[str] = Counter()
    for question in questions:
        options = question.get("options", [])
        if not 2 <= len(options) <= 4:
            errors.append(f"{question.get('id')}의 선택지는 2~4개여야 합니다.")
        for option in options:
            archetype = option.get("archetype")
            appearances[archetype] += 1
            if archetype not in archetype_ids:
                errors.append(f"{option.get('id')}가 알 수 없는 캐릭터를 참조합니다: {archetype}")
            weights = option.get("weights", {})
            if set(weights) != set(dimensions):
                errors.append(f"{option.get('id')}의 점수 차원이 일치하지 않습니다.")
            for dimension, value in weights.items():
                if not isinstance(value, int) or not -2 <= value <= 2:
                    errors.append(f"{option.get('id')}.{dimension} 값이 -2~2 정수가 아닙니다.")

    for item in archetypes:
        if appearances[item["id"]] == 0:
            errors.append(f"어떤 선택지에서도 등장하지 않는 캐릭터입니다: {item['id']}")
        asset = project_root / item.get("asset", "")
        if not asset.is_file():
            errors.append(f"캐릭터 이미지가 없습니다: {item.get('asset')}")
        if len(item.get("career_groups", [])) != 3:
            errors.append(f"{item['id']}의 추천 직무군은 정확히 3개여야 합니다.")
        tracks = item.get("career_tracks", {})
        if set(tracks) != {"stable", "independent", "public", "leadership"}:
            errors.append(f"{item['id']}의 직업 경로 구성이 올바르지 않습니다.")
        elif any(len(options) < 3 for options in tracks.values()):
            errors.append(f"{item['id']}의 각 직업 경로에는 예시가 3개 이상 필요합니다.")

    return errors

