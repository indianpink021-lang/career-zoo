# 프로젝트 작업 지침

- 디자인과 콘텐츠 판단 전에 루트의 `design.md`를 읽는다.
- 원본 소스는 `career_zoo/templates/`, `assets/`, `runs/`에 있다.
- `generated/`는 빌드 결과다. 직접 고치지 말고 원본을 수정한 뒤 다시 생성한다.
- 빌드는 프로젝트 루트에서 `python3 -m career_zoo demo`로 실행한다.
- 변경 후 `python3 -m unittest discover -s tests -v`를 실행한다.
- JavaScript 변경 후 `node --check`로 해당 템플릿과 생성 파일을 검사한다.
- 기존 테스트 URL, 결과 복원 해시, GA4 QA 모드를 깨뜨리지 않는다.
- 이미지 교체 시 투명도와 캔버스 구조를 보존하고 캐시 버전을 갱신한다.
- 캐릭터를 수정할 때 원본에 없던 얼굴 요소나 타인의 캐릭터 특징을 추가하지 않는다.
- 한국어 문구는 문장·의미 단위로 줄바꿈하고 단어 중간 강제 개행을 피한다.
- 사용자와 무관한 변경 및 미추적 파일은 커밋하지 않는다.
- 특히 `figma-access-confirmation.png`는 요청이 없는 한 건드리지 않는다.
- 배포 대상은 `generated/`이며 GitHub Pages 브랜치는 `gh-pages`다.
- 배포 전 `git diff --check`와 자동 검사를 통과해야 한다.
- 공개 배포 후 실제 URL에서 캐시 갱신과 모바일 표시를 확인한다.
