from __future__ import annotations

import argparse
import json
from pathlib import Path

from .builder import build_webapp
from .engine import simulate_distribution
from .spec import DEFAULT_RUN, PROJECT_ROOT, compile_spec, read_json, write_json
from .validation import validate_spec


def _path(value: str) -> Path:
    return Path(value).expanduser().resolve()


def _load_or_compile(path: Path) -> dict:
    if path.is_dir():
        return compile_spec(path)
    return read_json(path)


def command_compile(args: argparse.Namespace) -> int:
    spec = compile_spec(args.run)
    write_json(args.output, spec)
    print(f"사양 생성 완료: {args.output}")
    return 0


def command_validate(args: argparse.Namespace) -> int:
    spec = _load_or_compile(args.spec)
    errors = validate_spec(spec, PROJECT_ROOT)
    if errors:
        print("검증 실패")
        for error in errors:
            print(f"- {error}")
        return 1
    print("검증 통과: 질문, 점수, 결과, 이미지 참조가 유효합니다.")
    return 0


def command_simulate(args: argparse.Namespace) -> int:
    spec = _load_or_compile(args.spec)
    report = simulate_distribution(spec, None if args.exhaustive else args.samples, args.seed)
    if args.output:
        write_json(args.output, report)
    print(f"시뮬레이션: {report['method']} / {report['total']:,}개")
    for item in report["distribution"].values():
        print(f"- {item['name']}: {item['percent']:.2f}%")
    return 0


def command_build(args: argparse.Namespace) -> int:
    spec = _load_or_compile(args.spec)
    errors = validate_spec(spec, PROJECT_ROOT)
    if errors:
        for error in errors:
            print(f"- {error}")
        return 1
    build_webapp(spec, args.output)
    print(f"웹앱 생성 완료: {args.output}")
    return 0


def command_demo(args: argparse.Namespace) -> int:
    run = args.run
    spec_path = run / "test-spec.json"
    report_path = run / "round-07-simulation-generated.json"
    output = PROJECT_ROOT / "generated"
    spec = compile_spec(run)
    write_json(spec_path, spec)
    errors = validate_spec(spec, PROJECT_ROOT)
    if errors:
        for error in errors:
            print(f"- {error}")
        return 1
    report = simulate_distribution(spec)
    write_json(report_path, report)
    build_webapp(spec, output)
    print("데모 완료")
    print(f"- 사양: {spec_path}")
    print(f"- 검증: 통과")
    print(f"- 시뮬레이션: {report['total']:,}개 전체 조합")
    print(f"- 웹앱: {output}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="career_zoo", description="나의 다음 직업 찾기 커스텀 하네스")
    sub = parser.add_subparsers(dest="command", required=True)

    compile_parser = sub.add_parser("compile", help="Round 산출물을 test-spec.json으로 병합")
    compile_parser.add_argument("run", nargs="?", type=_path, default=DEFAULT_RUN)
    compile_parser.add_argument("--output", type=_path, default=DEFAULT_RUN / "test-spec.json")
    compile_parser.set_defaults(func=command_compile)

    validate_parser = sub.add_parser("validate", help="사양 구조와 에셋 참조 검증")
    validate_parser.add_argument("spec", nargs="?", type=_path, default=DEFAULT_RUN)
    validate_parser.set_defaults(func=command_validate)

    simulate_parser = sub.add_parser("simulate", help="결과 분포 시뮬레이션")
    simulate_parser.add_argument("spec", nargs="?", type=_path, default=DEFAULT_RUN)
    simulate_parser.add_argument("--samples", type=int, default=10000)
    simulate_parser.add_argument("--seed", type=int, default=42)
    simulate_parser.add_argument("--exhaustive", action="store_true")
    simulate_parser.add_argument("--output", type=_path)
    simulate_parser.set_defaults(func=command_simulate)

    build_parser = sub.add_parser("build", help="정적 웹앱 생성")
    build_parser.add_argument("spec", nargs="?", type=_path, default=DEFAULT_RUN)
    build_parser.add_argument("--output", type=_path, default=PROJECT_ROOT / "generated")
    build_parser.set_defaults(func=command_build)

    demo_parser = sub.add_parser("demo", help="사양 생성부터 웹앱 빌드까지 전체 흐름 실행")
    demo_parser.add_argument("--run", type=_path, default=DEFAULT_RUN)
    demo_parser.set_defaults(func=command_demo)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)

