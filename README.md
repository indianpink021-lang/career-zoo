# 나의 다음 직업 찾기 커스텀 하네스

허들링 클럽 4차 사이클 2차 실험을 위한 프로젝트입니다.

`나의 다음 직업 찾기`는 10개 이내의 질문을 통해 사용자의 업무 성향을 작은 동물 캐릭터로 보여주고, 탐색해볼 만한 직무군을 제안하는 모바일 심리테스트입니다. 이 저장소의 핵심 산출물은 테스트 한 편이 아니라, PRD와 사용자 스토리를 바탕으로 테스트 콘텐츠를 만들고 점수 품질을 검증해 실행 가능한 정적 웹앱으로 생성하는 커스텀 하네스입니다.

## 현재 단계

- [x] 과제 요구사항 정리
- [x] 제품 브리프 작성
- [x] PRD 초안 작성
- [x] 사용자 스토리 작성
- [x] Round 1~8 인터뷰 및 실행 기록
- [x] 테스트 사양 컴파일러와 검증기 구현
- [x] 전체 65,536개 응답 조합 시뮬레이션
- [x] 정적 웹앱 생성기 구현
- [x] 캐릭터 6종 투명 에셋 및 모바일 UI 제작
- [x] 실제 1회 실행과 브라우저 QA

## 문서

- [과제 요약](docs/assignment-brief.md)
- [제품 브리프](docs/product-brief.md)
- [PRD](docs/prd.md)
- [사용자 스토리](docs/user-stories.md)
- [하네스 설계](docs/harness-design.md)
- [비주얼 스타일 가이드](docs/visual-style-guide-draft.md)
- [Round 1~8 인터뷰 요약](runs/2026-10-31-career-zoo/interview-summary.md)

## 빠른 실행

별도 패키지 설치 없이 Python 3만 있으면 됩니다.

```bash
python3 -m career_zoo demo
python3 -m http.server 8000 --directory generated
```

브라우저에서 `http://localhost:8000`을 엽니다.

`demo` 명령은 다음 작업을 순서대로 수행합니다.

1. Round 3~8 산출물을 `test-spec.json`으로 병합
2. 질문·점수·결과·이미지 참조 검증
3. 65,536개 전체 응답 조합 결과 분포 계산
4. `generated/` 정적 웹앱 생성

## CLI

```bash
# 사양 생성
python3 -m career_zoo compile

# 사양 검증
python3 -m career_zoo validate runs/2026-10-31-career-zoo/test-spec.json

# 전체 응답 조합 시뮬레이션
python3 -m career_zoo simulate runs/2026-10-31-career-zoo/test-spec.json --exhaustive

# 정적 웹앱 생성
python3 -m career_zoo build runs/2026-10-31-career-zoo/test-spec.json

# 자동 테스트
python3 -m unittest discover -s tests -v
```

## 검증된 결과 분포

| 결과 | 비율 |
|---|---:|
| 탐색하는 토끼 | 17.04% |
| 뚝딱 만드는 햄스터 | 14.08% |
| 계획하는 고슴도치 | 18.79% |
| 연결하는 다람쥐 | 15.99% |
| 창작하는 친칠라 | 17.46% |
| 돌보는 수달 | 16.64% |

모든 결과가 합의한 정상 범위인 10~25% 안에 있습니다.

## 주요 산출물

- `career_zoo/`: Python CLI, 점수 엔진, 검증기, 웹앱 생성기
- `runs/2026-10-31-career-zoo/`: Round 1~8 인터뷰 기록과 확정 사양
- `assets/characters/`: 결과 캐릭터 6종 투명 PNG
- `generated/`: 실행 가능한 정적 웹앱
- `tests/`: 하네스 자동 테스트

