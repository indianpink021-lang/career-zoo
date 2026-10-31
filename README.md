# 생성된 정적 웹앱

이 폴더는 `python3 -m career_zoo build` 또는 `python3 -m career_zoo demo`로 생성됩니다.

## 실행

저장소 루트에서 다음 명령을 실행하세요.

```bash
python3 -m http.server 8000 --directory generated
```

브라우저에서 `http://localhost:8000`을 엽니다. 별도의 백엔드나 빌드 도구는 필요하지 않습니다.

## 포함 파일

- `test-spec.json`: 질문, 점수, 결과, 접근성 계약
- `index.html`, `styles.css`, `app.js`: 정적 웹앱
- `assets/`: 결과 캐릭터 6종 투명 PNG

