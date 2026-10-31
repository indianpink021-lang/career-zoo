# 나의 다음 직업 찾기 커스텀 하네스 설계

- 문서 상태: Approved v1.0
- 작성일: 2026-10-31
- 목적: PRD와 사용자 스토리를 바탕으로 AI와 라운드별 질문을 진행하고, 검증된 심리테스트 콘텐츠와 실행 가능한 정적 웹앱을 생성한다.

## 1. 하네스의 역할

하네스는 단일 프롬프트로 웹앱 전체를 작성하게 하지 않는다. AI가 구조화된 테스트 사양을 만들고, Python 코드가 그 사양을 검증하고, 고정된 템플릿이 웹앱을 렌더링한다.

```text
PRD + 사용자 스토리
        ↓
라운드별 AI 질문과 사용자 답변
        ↓
구조화된 테스트 사양 JSON
        ↓
점수·편향·도달 가능성 검증
        ↓
HTML/CSS/JavaScript 템플릿 렌더링
        ↓
실행 가능한 모바일 웹앱 + 검증 보고서
```

## 2. 설계 원칙

### AI는 제안하고 프로그램은 검증한다

캐릭터명과 문구에는 생성형 AI의 유연성을 사용하되, 점수 계산과 결과 도달 가능성은 결정적인 Python 코드로 검사한다.

### 모든 중간 결과를 파일로 남긴다

각 라운드의 질문, 사용자 답변, 변경 사항을 기록해 실험 과정을 재현할 수 있게 한다.

### 결과물은 반복 생성 가능해야 한다

동일한 확정 사양으로 웹앱을 다시 생성했을 때 기능적으로 같은 결과가 나와야 한다.

### 민감한 속성은 점수에 사용하지 않는다

성별, 나이, MBTI와 같은 속성이 점수 규칙에 들어가면 검증 단계에서 실패시킨다.

### 현재 전문성은 버리지 않고 연결한다

현재 직업 분야는 결과 캐릭터 점수에 사용하지 않는다. 대신 분야별로 일반적인 스킬과 전문성 후보를 연결해, 다음 직무군으로 가져갈 수 있는 자산을 가능성의 문장으로 보여준다.

## 3. Round 8 인터뷰 구성

공지사항의 진행 방식에 맞춰 하네스 제작 인터뷰를 정확히 여덟 라운드로 운영한다. 각 라운드는 이전 답변과 생성된 파일을 입력으로 사용하며, AI는 한 라운드에 핵심 질문을 최대 세 개만 제시한다. 질문, 사용자 답변, AI의 결정 요약과 변경된 파일을 모두 `transcript.md`에 남긴다.

### 인터뷰 준비. 문서 읽기

Round 1을 시작하기 전에 다음 문서를 읽는다.

- `docs/assignment-brief.md`
- `docs/product-brief.md`
- `docs/prd.md`
- `docs/user-stories.md`

목표, 비목표, 사용자, 기능 요구사항과 문서 사이의 충돌을 추출한다. 이 단계는 인터뷰 라운드 수에 포함하지 않는다.

출력:

- `runs/<run-id>/context.json`
- `runs/<run-id>/open-questions.md`

### Round 1. 문제와 성공 기준

확정 대상:

- 하네스가 반복적으로 해결해야 하는 작업
- 최종 사용자가 얻어야 하는 가치
- MVP 성공 기준과 명시적인 비목표

출력:

- `runs/<run-id>/round-01-problem.json`

### Round 2. 테스트 콘셉트와 말투

확정 대상:

- 서비스명과 부제
- 키치하고 러프한 유머와 말투의 강도
- 사용자가 결과에서 느껴야 할 감정
- 결과가 진로를 단정하지 않도록 하는 표현 원칙

출력:

- `runs/<run-id>/round-02-concept.json`

### Round 3. 성향 축과 점수 모델

확정 대상:

- 다섯 개 업무 성향 축
- 각 축의 의미와 점수 범위
- 캐릭터 선택 알고리즘과 동점 처리
- 점수에서 제외할 민감 정보
- 현재 직업 분야를 전문성 연결에만 사용하는 규칙

출력:

- `runs/<run-id>/round-03-scoring.json`

### Round 4. 결과 캐릭터

AI가 여섯 캐릭터가 충분히 구분되는지 검토하고 사용자에게 경계가 모호한 유형을 질문한다.

검토 기준:

- 캐릭터 기준 벡터 간 거리
- 결과 유형의 매력과 설명 길이 균형
- 추천 직무군 중복
- 부정적 또는 낙인찍는 표현

출력:

- `runs/<run-id>/round-04-archetypes.json`
- `runs/<run-id>/round-04-review.md`

### Round 5. 질문과 선택지

AI는 최대 10개의 질문과 선택지 초안을 만들고, Python 검증 결과를 바탕으로 사용자에게 수정이 필요한 항목을 질문한다.

검증 항목:

- 질문 수와 선택지 수 제한
- 모든 선택지의 유효한 점수 벡터
- 다섯 성향 축의 측정 횟수 균형
- 동일 의미 질문의 중복 가능성
- 사회적으로 바람직한 답이 지나치게 명확한지 여부
- 민감한 속성이 점수에 포함되는지 여부

출력:

- `runs/<run-id>/round-05-questions.json`
- `runs/<run-id>/round-05-validation.md`

### Round 6. 결과 카피와 직무군

AI는 각 캐릭터의 결과 설명을 만든 뒤, 직무군 중복과 확정적 표현을 검토해 사용자에게 최종 선택을 요청한다.

필수 필드:

- 유형명
- 캐치프레이즈
- 업무 성향 설명
- 넓은 추천 직무군 세 가지와 구체적인 직무 예시
- 현재 직업에서 가져갈 수 있는 스킬·전문성 연결 문구
- 잘 맞는 환경
- 피로할 수 있는 환경
- 이미지 대체 텍스트

금지 사항:

- 과학적 진단 주장
- 취업 성공 보장
- 행동 과제
- 성별 또는 전공에 따른 직업 단정

출력:

- `runs/<run-id>/round-06-results.json`
- `runs/<run-id>/round-06-content-review.md`

### Round 7. 시뮬레이션과 품질 조정

Python 코드가 무작위 및 경계 응답을 생성해 점수 모델을 검증한다. AI는 검증 보고서를 요약하고, 수정 대안별 영향을 설명한 뒤 사용자에게 선택을 요청한다.

검사 항목:

- 모든 결과의 도달 가능 여부
- 10,000개 무작위 응답의 결과 분포
- 특정 캐릭터로의 과도한 편향
- 동점 처리의 일관성
- 각 질문 제거 시 분포 변화

검증 실패 시 임의로 자동 수정하지 않는다. 사용자 선택에 따라 Round 3~6의 산출물을 갱신하고 다시 검증한다.

출력:

- `runs/<run-id>/round-07-simulation.json`
- `runs/<run-id>/round-07-validation-report.md`

### Round 8. 시각 방향과 최종 승인

마지막 라운드에서는 생성할 웹앱의 시각적·기능적 계약을 확정한다.

확정 대상:

- 캐릭터 이미지의 스타일과 공통 규칙
- 모바일 화면의 톤, 색상, 타이포그래피 방향
- 결과 카드에 포함할 정보
- 접근성 및 모션 감소 방식
- 최종 `test-spec.json`과 생성 범위 승인

출력:

- `runs/<run-id>/round-08-visual-contract.json`
- `runs/<run-id>/test-spec.json`
- `runs/<run-id>/interview-summary.md`

Round 8 승인 후 확정 사양을 템플릿에 주입해 다음 정적 웹앱 파일을 만든다.

- `generated/test-spec.json`
- `generated/index.html`
- `generated/styles.css`
- `generated/app.js`
- `generated/assets/`
- `generated/README.md`

## 4. 테스트 사양 개요

최종 `test-spec.json`은 다음 구조를 따른다.

```json
{
  "meta": {
    "title": "나의 다음 직업 찾기",
    "version": "0.1.0"
  },
  "dimensions": [],
  "currentFields": [],
  "transferableSkillMap": {},
  "profileQuestions": [],
  "scoredQuestions": [],
  "archetypes": [],
  "resultCard": {
    "width": 1080,
    "height": 1350
  },
  "disclaimer": "이 결과는 재미를 위한 자기 탐색 콘텐츠입니다."
}
```

각 점수 선택지는 캐릭터 투표 하나와 다섯 차원의 정수 벡터를 가진다. 캐릭터별 득표를 질문 내 등장 횟수로 정규화하고 가장 높은 값을 대표 결과로 사용한다. 동점이면 전체 응답의 평균 성향 벡터와 각 캐릭터 기준 벡터의 거리를 비교한다. 절댓값이 가장 큰 성향 축을 보조 태그로 표시한다. 현재 직업 분야는 이 계산에서 제외하고 `transferableSkillMap`을 통한 전문성 연결 문구에만 사용한다.

## 5. 예상 CLI

```bash
# 새 실행 시작
python -m career_zoo start

# 중단된 실행 이어가기
python -m career_zoo resume runs/<run-id>

# 현재 사양 검증
python -m career_zoo validate runs/<run-id>/test-spec.json

# 결과 분포 시뮬레이션
python -m career_zoo simulate runs/<run-id>/test-spec.json --samples 10000

# 정적 웹앱 생성
python -m career_zoo build runs/<run-id>/test-spec.json

# 예제 데이터로 전체 흐름 시연
python -m career_zoo demo
```

## 6. 실행 상태

각 실행은 독립된 폴더에 상태를 저장한다.

```text
runs/2026-10-31T200000/
├── session.json
├── transcript.md
├── context.json
├── open-questions.md
├── round-01-problem.json
├── round-02-concept.json
├── round-03-scoring.json
├── round-04-archetypes.json
├── round-05-questions.json
├── round-06-results.json
├── round-07-simulation.json
├── round-07-validation-report.md
├── round-08-visual-contract.json
├── interview-summary.md
└── test-spec.json
```

`session.json`은 현재 라운드, 완료 여부, 입력 문서 해시, 사용 모델, 생성 시각을 기록한다. API 키나 사용자 민감 정보는 저장하지 않는다.

## 7. 실패 처리

- JSON 형식 오류: AI에게 스키마 오류만 전달해 한 번 재생성한다.
- 필수 필드 누락: 다음 라운드로 진행하지 않는다.
- 점수 검증 실패: 실패 원인과 수정 후보를 사용자에게 보여준다.
- API 호출 실패: 세션을 보존하고 같은 라운드에서 재시도할 수 있게 한다.
- 캐릭터 이미지 누락: 앱 생성은 중단하고 누락 파일을 명시한다.
- 결과 카드 생성 실패: 텍스트 결과는 유지하고 사용자에게 저장 실패를 알린다.

## 8. 테스트 전략

### 단위 테스트

- 점수 벡터 합산
- 최근접 캐릭터 선택
- 동점 처리
- 스키마 검증
- 민감 속성 탐지
- 현재 직업 분야가 캐릭터 점수에 영향을 주지 않는지 검사
- 전문성 연결 문구가 실제 보유 능력을 단정하지 않는지 검사
- 결과 카드 데이터 구성

### 속성 기반 또는 생성 테스트

- 임의의 유효 응답은 항상 결과 하나를 반환한다.
- 동일 응답은 항상 동일 결과를 반환한다.
- 모든 결과 유형은 적어도 하나의 응답 조합으로 도달 가능하다.

### 통합 테스트

- 예제 PRD에서 최종 웹앱까지 생성한다.
- 생성된 파일의 참조가 모두 유효하다.
- 질문을 완료하고 결과 이미지를 만드는 핵심 흐름이 동작한다.

## 9. 제출용 증거

- 라운드별 질문과 사용자 답변이 담긴 `transcript.md`
- 하네스 실행 터미널 스크린샷
- 점수 분포 및 도달 가능성 검증 보고서
- 생성된 나의 다음 직업 찾기 웹앱
- 모바일 테스트 진행 및 결과 화면 스크린샷
- 저장된 PNG 결과 카드
- GitHub 저장소 링크

## 10. 구현 순서

1. JSON 스키마와 예제 `test-spec.json` 작성
2. 점수 계산기와 검증기 구현
3. 분포 시뮬레이터 구현
4. 정적 웹앱 템플릿 구현
5. 결과 카드 PNG 생성 구현
6. AI 라운드 실행기와 세션 저장 구현
7. 실제 한 번의 전체 실행 기록 생성
8. 모바일 브라우저 검증 및 제출 자료 정리

