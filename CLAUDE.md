# 어촌생활 작업 규칙 (Claude용)

> **두 Claude(서로 다른 계정)가 함께 작업해요.** 시작하기 전에 [`HANDOFF.md`](HANDOFF.md)(인수인계: 코드 지도 · 결정 사항 · 남은 일 · 테스트법)를 읽어요.
> 그다음 [`WORK.md`](WORK.md)에 내 작업을 찜하고 push해요. 다른 쪽이 찜한 영역은 건드리지 않아요.
> 작업 전에는 항상 `git pull --rebase origin main`을 해요.

이 저장소는 단일 파일 3D 멀티플레이 게임 「어촌생활」이에요. 사용자와는 **한국어**로 이야기해요.

## 구조
- `index.html`: 게임 전체 원본(three.js r128). 서버 API는 `window.claude.use("db" | "user" | "room")`만 써요.
- `web/public/platform.js`: 그 API를 Firebase로 구현해요(웹사이트판).
- `tools/build_web.py`: `index.html`에 Firebase 스크립트를 끼워 `web/public/`을 만들어요. 결과물은 커밋하지 않아요(.gitignore).
- `web/firestore.rules`, `web/database.rules.json`: 웹판 보안 규칙.
- 새 공유 컬렉션을 만들면 **두 군데 다** 규칙을 넣어요.
  - 웹판: `web/firestore.rules`.
  - 아티팩트판: Artifact 게시 때의 `capabilities.db.rules`. 다시 게시할 때 기존 규칙을 모두 다시 적어요.

## 업데이트할 때마다 반드시 할 것
사용자가 이 저장소의 기록을 업데이트 로그로 쓰기로 했어요. 기능을 고치거나 추가할 때마다:

1. `index.html`의 `GAME_VER`를 올려요.
   - 새 기능은 가운데 자리(1.15.0 → 1.16.0), 버그 수정만이면 끝자리를 올려요.
2. `CHANGELOG.md` **맨 위**에 새 항목을 추가해요.
   - 형식: `## vX.Y.Z — YYYY-MM-DD · 제목`.
   - 사용자 눈높이의 한국어로 무엇이 바뀌었는지 적어요.
   - 보안 규칙이 바뀌면 제목에 🔒를 붙여요.
3. `FEATURES.md`에서 해당 기능 설명을 고쳐요. 위쪽 "현재 버전"도 고쳐요.
4. 검증할 것
   - `python3 tools/build_web.py`가 통과하는지 확인해요.
   - 가능하면 Playwright로 실제 화면을 열어 확인해요.
5. 커밋하고 `main`에 올려요.
   - 커밋 메시지는 `vX.Y.Z: 요약`.
   - `main`에 올라가면 `.github/workflows/deploy.yml`이 웹사이트에 자동 배포해요. 사용자가 원한 흐름이라 `main`에 바로 올려요.
6. Claude 아티팩트(https://claude.ai/artifact/EAMgfyYh8omwBQFjH5ZCof)에도 같은 `index.html`을 다시 게시해요.
   - URL을 지정하고, capabilities를 빠짐없이 적어요.

## 맵 · 화면 품질 (사용자 요청: 앞으로도 계속 신경 쓸 것)
- 새 건물이나 구역을 만들면 배치 · 동선 · 소품(나무 · 가로등 · 화단 · 벤치 · 바닥재)까지 다듬어요.
- 위에서 내려다본 스크린샷과 정면 스크린샷을 확인한 뒤에 올려요.
- 가게 화면은 가게마다 고유한 인터페이스(보기와 쓰임 모두)로 만들어요. 다 비슷한 목록 화면은 피해요.
- 돈은 화면에 항상 원으로 보여요(`won()`). 안쪽 단위 1 = 100원이에요. 가격 입력칸은 원 단위로 받고 `/ WON`으로 바꿔요.

## 주의
- 골드와 진행은 클라이언트가 계산해요(조작 방지 서버 없음). 경제 관련 기능은 이 점을 감안해 상한을 둬요.
- `web/public/firebase-config.js`에는 사용자의 실제 Firebase 설정이 들어가요. 견본 값으로 덮어쓰지 않아요.
- 특정 기존 게임을 그대로 베끼지 않아요.
