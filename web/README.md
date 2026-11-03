# 어촌생활 · 웹사이트로 서버 열기 (Firebase)

이 폴더를 Firebase에 올리면 `https://내프로젝트.web.app` 주소로 누구나 접속해서 함께 놀 수 있어요.
게임 코드는 그대로이고, `public/platform.js`가 로그인 · 공유 DB · 실시간 접속자를 Firebase에 연결해요.

```
web/
├─ public/              ← 실제로 올라가는 사이트 (index.html, platform.js, firebase-config.js, a/, fish/)
├─ firebase.json        ← 호스팅 · 규칙 설정
├─ firestore.rules      ← Firestore 보안 규칙
├─ database.rules.json  ← Realtime Database 보안 규칙
└─ .firebaserc          ← 프로젝트 ID
```

---

## 1. Firebase 프로젝트 만들기 (10분)

1. https://console.firebase.google.com 에서 **프로젝트 추가** → 이름 예: `eochon-life`.
2. 프로젝트 개요 → **</> (웹 앱 추가)** → 앱 이름 입력 → 나오는 `firebaseConfig` 값을 복사해요.
3. `public/firebase-config.js`를 열어서 `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`에 붙여 넣어요.
4. `.firebaserc`의 `"프로젝트ID"`를 내 프로젝트 ID로 바꿔요.

## 2. 로그인 켜기

**빌드 → Authentication → 시작하기 → 로그인 방법**에서:

- **Google** 사용 설정 (지원 이메일만 고르면 끝)
- **익명** 사용 설정 (게스트로 둘러보기)

## 3. 데이터베이스 두 개 만들기

- **Firestore Database** → 데이터베이스 만들기 → 위치 `asia-northeast3 (서울)` → 프로덕션 모드.
- **Realtime Database** → 데이터베이스 만들기 → 위치 `asia-southeast1 (싱가포르)`.
  만든 뒤 화면 위에 보이는 주소(`https://…firebasedatabase.app`)를 `firebase-config.js`의 `databaseURL`에 넣어요.

## 4. 올리기 (배포)

컴퓨터에 [Node.js](https://nodejs.org)가 있으면 터미널에서:

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

`web` 폴더 안에서:

```bash
firebase deploy
```

끝나면 `Hosting URL: https://내프로젝트.web.app` 이 나와요. 그 주소가 게임 서버예요.
(보안 규칙 두 개도 같이 올라가요.)

## 5. 나를 운영자로 만들기

운영자는 후원자 관리(방류권 지급)와 후원 안내를 바꿀 수 있고, 테스트 골드 버튼이 보여요.

1. 사이트에서 구글로 한 번 로그인해요.
2. 콘솔 **Authentication → 사용자** 에서 내 계정의 **사용자 UID**를 복사해요.
3. **Firestore → 컬렉션 시작** → 컬렉션 ID `admins` → 문서 ID에 그 UID → 필드 아무거나(예: `on` = `true`) → 저장.
4. 사이트를 새로고침하면 설정(⚙)에 「후원자 관리」가 생겨요.
5. 같은 곳에 「제보함」도 생겨요. 메인 화면의 **오류 제보 · 건의하기**로 들어온 글을 모아 보고, 답장을 보내면 그 사람 우편으로 도착해요.
   (콘솔 **Firestore → feedback** 컬렉션에서도 볼 수 있어요.)

**초대 링크**: 게임 안 「친구 초대」에서 `https://내프로젝트.web.app/?ref=코드` 링크를 복사할 수 있어요. 이 링크로 처음 들어온 사람은 입장할 때 추천인이 자동으로 입력돼요.

## 6. 카카오 로그인 (선택)

카카오는 Firebase 기본 제공이 아니라서 **OpenID Connect**로 연결해요. Blaze(종량제) 요금제가 필요하지만 소규모는 사실상 무료예요.

1. https://developers.kakao.com → 내 애플리케이션 → 앱 만들기.
2. **카카오 로그인** 활성화, **OpenID Connect** 활성화.
3. Redirect URI에 `https://내프로젝트.firebaseapp.com/__/auth/handler` 추가.
4. **앱 키 → REST API 키**, **보안 → Client Secret** 을 복사해요.
5. Firebase 콘솔 → Authentication → 설정 → **Identity Platform으로 업그레이드**.
6. 로그인 방법 → **새 제공업체 추가 → OpenID Connect**
   - 이름: `kakao` (제공업체 ID가 `oidc.kakao`가 되어야 해요)
   - 클라이언트 ID: REST API 키 · 발급자: `https://kauth.kakao.com` · 클라이언트 보안 비밀번호: Client Secret
   - 승인 유형: **코드 흐름**
7. `firebase-config.js`에서 `kakao: true` 로 바꾸고 다시 `firebase deploy`.

## 7. 내 도메인 연결 (선택)

Hosting → **커스텀 도메인 추가** → 예: `eochon.kr`. 안내대로 DNS를 넣으면 HTTPS까지 자동이에요.
그다음 Authentication → 설정 → **승인된 도메인**에 그 도메인을 추가해요 (안 하면 로그인 창이 막혀요).

## 8. 게임을 고친 뒤 다시 올리기

게임 원본은 프로젝트 맨 위의 `index.html` 하나예요. 고친 뒤 프로젝트 폴더에서:

```bash
python3 tools/build_web.py
```

그다음 `web` 폴더에서 `firebase deploy`. (`firebase-config.js`는 덮어쓰지 않아요.)

---

## 무료로 얼마나 버티나요?

| 항목 | 무료(Spark) 한도 | 어촌생활에서 쓰는 양 |
|---|---|---|
| 동시 접속 (Realtime DB) | **100명** | 접속한 탭 1개 = 1명 |
| Firestore 읽기 | 하루 5만 회 | 접속할 때 약 150~600회 + 채팅·노점 변화마다 |
| Firestore 쓰기 | 하루 2만 회 | 진행 저장(움직일 때 몇 초에 한 번) 등 |
| 호스팅 전송 | 하루 360MB | 처음 접속 약 2MB (이후 캐시) |

하루 접속자가 수십 명을 넘으면 **Blaze(종량제)**로 바꾸세요. 그래도 수백 명 규모는 보통 월 몇 천 원 수준이에요.
콘솔 → 사용량 및 결제에서 **예산 알림**을 꼭 걸어 두세요.

## 알아 둘 점

- **골드 조작**: 진행(골드 · 가방)은 각 플레이어 브라우저가 계산해서 저장해요. 보안 규칙이 남의 진행은 못 건드리게 막지만,
  개발자 도구로 **자기 골드를 조작하는 것**까지는 막지 못해요. 낯선 사람이 많이 오는 공개 서버라면 서버 검증(Cloud Functions)을 더해야 해요.
- **주식 시세**는 서버 없이 시각만으로 계산해서 모두 같은 값을 봐요. 서버 비용이 들지 않아요.
- Claude 아티팩트판의 저장 데이터는 이 서버로 옮겨지지 않아요. 새 서버에서 처음부터 시작해요.
