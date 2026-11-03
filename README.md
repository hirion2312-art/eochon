# 🎣 어촌생활

함께 낚시하고, 회를 팔고, 갯벌을 캐고, 주식과 복권까지 즐기는 **3D 멀티플레이 바닷가 마을 게임**이에요.

- 🤝 **인수인계 · 함께 작업하기**: [HANDOFF.md](HANDOFF.md) · [WORK.md](WORK.md)
- 📖 **전체 기능 정리**: [FEATURES.md](FEATURES.md)
- 📝 **업데이트 로그**: [CHANGELOG.md](CHANGELOG.md)
- 🌐 **웹사이트 서버 여는 법 (Firebase)**: [web/README.md](web/README.md)

## 폴더 구성

```
index.html          ← 게임 전체 (원본 · 이것만 고치면 돼요)
a/                  ← 텍스처 · 소품 모델 · 배경음악(bgm-*.mp3)
fish/               ← 3D 물고기 모델
credits/            ← 에셋 출처
tools/build_web.py  ← 게임을 웹사이트판(web/public)으로 만드는 스크립트
tools/test/         ← 헤드리스 테스트 (가짜 서버 · 스모크 · 손맛 시뮬레이션)
web/                ← Firebase 설정 · 보안 규칙 · platform.js (Firebase 연결)
.github/workflows/  ← main에 올라오면 웹사이트에 자동 배포
```

## 업데이트가 사이트에 반영되는 흐름

1. `index.html`(또는 `a/`, `web/`)을 고쳐서 `main` 브랜치에 올려요.
2. GitHub Actions가 `tools/build_web.py`로 웹판을 만들고 **Firebase Hosting에 자동 배포**해요.
   진행 상황은 저장소 **Actions** 탭에서 볼 수 있어요.
3. 보안 규칙이 바뀐 업데이트(로그의 🔒 표시)는 자동 배포 계정에 권한이 있으면 같이 올라가요.
   권한이 없으면 내 컴퓨터의 `web` 폴더에서 아래 명령을 한 번 실행해요.

   ```bash
   firebase deploy --only firestore:rules,database
   ```

## 자동 배포 켜기 (처음 한 번)

1. **Firebase 설정값 넣기**: 저장소의 `web/public/firebase-config.js`를 내 Firebase 프로젝트 값으로 바꿔서 올려요.
   - 이미 사이트를 배포했다면, 내 컴퓨터의 그 파일을 그대로 업로드하면 돼요.
   - 이 값은 사이트에 공개되는 값이라 저장소에 올려도 괜찮아요.
2. **배포 권한 연결**: 내 컴퓨터의 `web` 폴더에서 아래 명령을 실행해요.

   ```bash
   firebase init hosting:github
   ```

   - 저장소를 물으면 `hirion2312-art/eochon` 을 입력해요.
   - 빌드 스크립트 질문은 **No**, 자동 배포 질문은 아무거나 골라도 돼요.
   - 그러면 저장소 Secrets에 `FIREBASE_SERVICE_ACCOUNT_…` 키가 자동으로 등록돼요.
   - 이 명령이 내 컴퓨터에 새로 만든 `.github/workflows/firebase-hosting-*.yml` 파일은 **올리지 말고 지워도 돼요**. 이 저장소에는 이미 `deploy.yml`이 있어요.
3. 저장소 **Actions** 탭 → 「웹사이트 자동 배포」 → **Run workflow**를 눌러 한 번 시험해요.

키가 없으면 배포 단계는 건너뛰고 안내만 남겨요. 실패로 처리하지 않아요.

## Claude 아티팩트판

같은 `index.html`을 Claude 아티팩트로도 게시해요: https://claude.ai/artifact/EAMgfyYh8omwBQFjH5ZCof
아티팩트판은 claude.ai가 서버 역할을 하고, 데이터는 웹사이트판과 따로 저장돼요.
