# 어촌생활 인수인계 자료

> 마지막 정리: 2026-11-03 · 기준 버전 **v1.20.0**
> 이 저장소는 이제 **두 Claude(서로 다른 계정)가 함께** 작업해요. 작업 전에 이 문서와 [`WORK.md`](WORK.md)를 꼭 읽어 주세요.
> 함께 볼 문서: [`CLAUDE.md`](CLAUDE.md)(작업 규칙) · [`FEATURES.md`](FEATURES.md)(전체 기능) · [`CHANGELOG.md`](CHANGELOG.md)(업데이트 기록)

---

## 1. 한눈에 보기

- **무엇**: 브라우저 3D 멀티플레이 바닷가 마을 게임 「어촌생활」이에요. 낚시 · 회 · 노점 · 갯벌 · 배 · 주식 · 복권 · 집 · 직업 · 랭킹이 있어요.
- **운영자**: 저장소 주인(이재헌)이에요. 한국어로 이야기하고, 친근한 존댓말로 쉽게 설명하는 걸 좋아해요.
- **배포**는 두 곳이에요.
  1. **웹사이트(메인)**: https://eochon-life.web.app
     - Firebase Hosting으로 배포하고, 서버는 Firebase Auth / Firestore / Realtime Database를 써요.
     - `main`에 push하면 GitHub Actions가 자동으로 배포해요.
  2. **Claude 아티팩트판**: https://claude.ai/artifact/EAMgfyYh8omwBQFjH5ZCof
     - 처음 계정(원 작업자) 소유라서 그 계정의 Claude만 다시 게시할 수 있어요.
     - 다른 계정 Claude는 신경 쓰지 않아도 돼요. 원 작업자 쪽이 가끔 맞춰 둬요.
- **코드 구조**: 게임 전체가 **`index.html` 한 파일**(약 8,400줄, three.js r128)이에요. 빌드 도구는 없어요.

## 2. 코드 지도 (`index.html`)

섹션 머리는 `/* ===================== 이름 =====================` 모양이에요. `grep -n "^/\* =====" index.html`로 목록을 볼 수 있어요.

| 섹션 | 하는 일 · 핵심 이름 |
|---|---|
| 데이터 정의 | `GAME_VER`, `TIERS`(6등급), `BAITS`, `RELEASE`, `BUILTIN`(기본 물고기 58종, `art`·`where`), `HOME`·`HOUSES`·`FURN`, `JOBS`, `CLOTHES` |
| 유틸 | `fmt`, **`won()`**(돈 표시), `WON = 100`, `h()`(DOM 만들기), `clamp`, `lsGet/lsSet` |
| 물고기 그림 | `drawProcFish`, `drawShapeFish`(flat · ray · eel · dragon · squid · octo), `fishArt` |
| 상태 · 저장 | `newProfile`, `normProfile`(저장 데이터 검증 · 이전 버전 호환), `P`(내 진행), `S`(화면 상태), `markDirty`, `flushSave` |
| 도전과제 | `ACH`(배열), `checkAch`, 칭호 `ACH_TITLES` |
| 은행 · 복권 | `STOCKS`, `priceAt`(시각으로 계산하는 공유 시세), `newsAt`, `SLOT_SYMS`, 즉석 복권 |
| 코치 카드 | `TUTS`, `coach(id)` — 처음 하는 행동 안내 |
| 시간 | `gameHour()` = 실제 한국 시각, `periodFor(hr)`(하늘색을 `SKY_KEYS` 사이에서 섞음) |
| 낚시 루프 | `rollFish`(등급 · 신화 · `habitatW`), `hook`, `junkCatch`, `startReel`/`fightStep`/`endReel`, **`TIER_FIGHT`**(등급별 손맛 수치) |
| 월드 · 이동 | `walkable(x,z)`(걸을 수 있는 곳), `placeAt`, `PLACES`, `nearestAction`(가까이 가면 뜨는 버튼), `stepMove` |
| 접속자 | `fullPresence`, `otherPeers(all)`(같은 곳 = 같은 `home` 값인 사람만) |
| 우편함 | `sendInbox`, `handleInbox`(type: royalty · sale · referral · notice · admin_gift …) |
| 3D 월드 | `buildLand/Pier/Market/Shops/Beach/Hall/Uptown/Realty`, `loop3D`(매 프레임), `applyPeriod`(하늘) |
| 시트(화면) | `SHEETS.<이름> = (body) => {…}`, `openSheet(name, arg)`, `setHead`, `refreshSheet` |
| 명예의 전당 | `RANK_CATS`, 기록은 **`records/rank_<uid>`**에 저장, `hallTick`(동상 갱신) |
| 동사무소 · 직업 | `setJob`, `needJob`, `jobLv`, 횟집 사장만 회 뜨기 · 팔기 |
| 마이 홈 · 부동산 | `enterHouse/leaveHouse`, `buildHomeScene`(`HOME` 좌표 300,300에 그때그때 짓기), `decoTap`(꾸미기), `houses/<uid>` |
| 운영자 도구 | `SHEETS.admintools`, `config/notice` · `config/event` · `config/mutes`, `evMul()` |
| 시작 | `boot()` → 서버 연결 → 구독(chat · stalls · boat · config …) |

**웹판 연결**: `web/public/platform.js`가 게임이 쓰는 `window.claude.use("db"|"user"|"room")` API를 Firebase로 구현해요.
- 게임 코드는 Firebase를 직접 부르지 않아요.
- `tools/build_web.py`가 `index.html`에 Firebase 스크립트를 끼워 `web/public/index.html`을 만들어요. 이 결과물은 커밋하지 않아요.

## 3. 꼭 지킬 규칙 (요약 · 자세한 건 CLAUDE.md)

1. **업데이트마다**
   - `GAME_VER`를 올려요.
   - `CHANGELOG.md` 맨 위에 항목을 추가해요.
   - `FEATURES.md`를 고쳐요.
   - `python3 tools/build_web.py`를 실행해요.
   - 테스트한 뒤 `main`에 push해요.
2. **돈은 화면에 늘 원**으로 보여요(`won(n)`, 안쪽 1 = 100원). 가격 입력칸은 원으로 받아서 `/ WON` 해요.
3. **새 공유 데이터 경로**를 만들면 `web/firestore.rules`에도 규칙을 넣어요.
   - 지금은 자동 배포 계정에 규칙 배포 권한이 없어서(403), **규칙은 운영자가 직접 올려야** 할 수 있어요.
   - 그래서 **이미 열려 있는 경로를 쓰는 방법도 고려**해요. 예: 명예의 전당은 `records/`를 써요.
4. **외관 품질**: 새 건물이나 구역은 배치 · 동선 · 소품까지 다듬고, 스크린샷으로 확인해요. 운영자가 특히 강조한 부분이에요.
5. **저장 데이터 호환**: `normProfile` · `normHome` 등에서 예전 저장 데이터가 깨지지 않게 기본값을 줘요.
6. 커밋 메시지는 `vX.Y.Z: 요약`이에요. PR 없이 `main`에 바로 올려요(운영자가 원한 흐름).

## 4. 두 Claude 함께 작업하기

- **작업 시작 전**
  - `git pull --rebase origin main`을 해요.
  - [`WORK.md`](WORK.md)의 「지금 하는 일」에 내 줄을 추가해서 push해요(찜하기).
  - 다른 쪽이 찜한 영역(같은 시트 · 같은 건물 · 같은 함수)은 건드리지 않아요.
- **버전 번호**: push 직전에 `CHANGELOG.md` 맨 위 번호를 확인하고 그다음 번호를 써요. 겹치면 늦게 올리는 쪽이 번호를 올려요.
- **작게 자주** 커밋해요. `index.html`이 한 파일이라 오래 붙잡고 있으면 충돌이 커져요.
- **충돌이 나면** `git pull --rebase`로 상대 변경을 먼저 받고, 내 변경을 그 위에 다시 맞춰요. 상대 코드를 지우지 않아요.
- **끝나면** `WORK.md`에서 내 줄을 「최근 끝낸 일」로 옮겨요.

## 5. 테스트하는 법

```bash
python3 tools/test/make_test_page.py
```

```bash
cd tools/test/site && python3 -m http.server 8765
```

```bash
node tools/test/smoke.js /tmp/shots
```

```bash
node tools/test/fight_sim.js
```

- `make_test_page.py`: `index.html`을 가짜 서버(`mockdb.js`)와 함께 `tools/test/site/`에 복사하고, `window.T`에 테스트 손잡이를 달아요.
  - 손잡이: `T.P()`, `T.S`, `T.ME`, `T.open(시트)`, `T.cam` 등.
- `smoke.js`: PC와 휴대폰 화면으로 입장해서 시트를 열고 스크린샷을 찍어요. 콘솔 오류도 보여 줘요.
  - 볼 시트는 `SHEETS=shop,clothes`처럼 고를 수 있어요.
  - 소프트웨어 렌더링이라 화면 하나에 10초쯤 걸려요.
- `fight_sim.js`: 등급별 손맛 승률과 시간을 시뮬레이션해요. `TIER_FIGHT`를 고친 뒤 꼭 돌려요.
- 카메라를 원하는 곳에 두고 찍으려면 `T.ME.x/z`, `T.cam.pitch/dist/yaw`를 바꾸고 기다린 뒤 스크린샷을 찍어요.

## 6. 운영자 결정 사항 (대화에서 정한 것)

- **출시 때 동사무소 · 마이 홈은 잠가요** (v1.23.0). `index.html`의 `LOCKED = { office: true, home: true }` 한 줄로 열고 닫아요.
  - 잠금은 `openSheet` · `goOffice` · `goRealty` · `enterHouse` 입구에서 막아요. 운영자(`S.isOwner`)는 시험용으로 통과해요.
  - **회 뜨기 · 노점 판매는 누구나** 해요(v1.25, 운영자 결정). `isJob("sashimi")`는 잠금과 상관없이 늘 참이에요.
- **마을 손님(NPC)** (v1.25): `npcVisit` 이 노점 사장님 쪽 화면에서만 노점을 잠그고(`stallEdit(…, quiet)`) 사요. 물고기 값의 1.3배(`NPC_SALE_CAP`)까지, 하루 40접시(`NPC_SALE_MAX`, `P.npcSales`). 시장 길 손님 캐릭터 `SHOPPERS`는 보기용(각자 화면).
- **마을 사람들 `TOWNFOLK`** (v1.30): `townTick` (`loop3D`에서 `npcShopTick` 다음). 주인 = 나 + 마을에 있는 `otherPeers(true)`(집 밖), 주인당 3명(키 `uid#0~2`, 최대 8명 = 24 NPC). `townPlan(key)`가 `mixHash`로 역할(`TOWN_ROLES`) · 길(`TOWN_NODES`/`TOWN_EDGES` 그래프 48칸 + 시작점 복귀)을 정하고, `townPos(plan, Date.now()/1000)`가 시각만으로 위치를 내서 모든 화면이 같아요(통신 없음). 새 구역을 만들면 노드 · 간선을 추가해요(`STOP_NODES`는 쉬어 가는 곳).
- **겹침 방지** (v1.30): `rebuildChars()`가 매 프레임 `CHARS`(다른 사람 · `TOWNFOLK` · `SHOPPERS`의 보이는 위치)를 모아요. `sepPush(self,x,z,R)`로 보기 위치 오프셋(`sx/sz`)을 부드럽게 줘요(데이터 좌표는 그대로). 나는 `stepMove`에서 `charBlocked`로 가까워지는 이동만 막고 ±40°/75° 옆걸음을 해요. 앉은 사람 · 노점 의자는 제외.
- **낚시 허점 막기** (v1.30): `WAIT_MIN`(입질 최소 3초), 자동 모드에서 `AUTO_MAX_TIER`(3=영웅) 이상은 도망, `document.hidden`이면 일시정지, `AUTO_IDLE_MS`(15분 무입력) → `autoIdleStop()`.
- **행동 연출** (v1.31): `fxBurst` · `fxRing` · `fxPop` · `fxFn`이 `FX` 배열에 들어가고 `updateFx`가 움직여요. 행동별 묶음은 `ACT_FX`(splash · bite · hook · miss · sell · eat · level · dig · quest). 잡은 물고기 포물선 → 머리 위 들기는 `updateChar`의 `cpose`(`ci.at` 기준, 다른 사람도 같은 모습).
- **대물 수면 돌파** (v1.31): `endReel(ok)`에서 영웅 이상이면 `startBreach` → `breachTick`(프레임 시간 `B.s`로 진행, 느린 기기도 건너뛰지 않음) → `finishBreach` → `landFish`. 진행 중엔 `S.phase = "reel"`이라 `tickInner`가 쉬고, 25초 넘으면 강제로 끝내요. 화면 띠는 `#cine`, 카메라는 `cam.bz` · `S.shake`.
- **물고기 값** (v1.31): `TIERS[].base` 25/75/300/1400/6000/22000. 팔 때 `curPrice(it)`로 예전 물고기도 새 값 이상으로 쳐 줘요.
- **퀵바** (v1.32): `QUICK_ITEMS`(넣을 수 있는 칸) · `P.quick`(id 배열, 최대 `QUICK_MAX`=6) · `applyQuick()`가 `.dock` 버튼을 숨기고 CSS `order`로 정렬해요. 원래 있던 5개 버튼은 그대로 두고 `data-q`만 붙이고, 나머지는 `quickBtnFor`가 만들어요. 새 칸을 만들려면 `QUICK_ITEMS`에 `open`(시트) 또는 `run`과 `QSVG` 아이콘을 넣어요.
- **초보 수첩 · 도움말** (v1.32): `GUIDE_STEPS`(done · go · reward), `P.guide`(받은 단계). 오른쪽 `#guideBtn`. 시트 머리의 `#sheetHelp`는 `TUTS["sheet_" + 이름]`이 있으면 보이고 `showHelp`로 그 카드를 다시 띄워요. 새 화면을 만들면 `TUTS`에 `sheet_이름` 설명을 꼭 넣어요.
- **직접 만든 3D 물고기** (v1.34): `buildProcFish()`가 `model`이 없는 BUILTIN과 `SHELL_ART`를 `art` 값으로 깎아서 `FISH3D`에 넣어요(`proc: true`, 납작한 것은 `top: true` → 사진은 위에서 본 모습). 모양별 함수 `pfFish` · `pfEel` · `pfFlat` · `pfRay` · `pfOcto` · `pfSquid` · `pfDragon` · `pfClam` · `pfRazor` · `pfCrab`, 텍스처 `pfTexture`(위 3/4 몸통 · 아래 지느러미 띠 · 눈 색 칸). 새 물고기는 `art`만 적으면 자동으로 3D가 돼요(`shape`으로 모양 고르기).
- **섬 맵** (v1.45): 해안선 `ISLAND`(점 목록) · `inIsland` · `coastInfo`(해안까지 거리). 지형은 높이 격자 `TER`(4m 칸, `terRaw` → `buildTerrainGrid`) 하나를 메시와 `groundY`(`terH`)가 같이 써요. 마을 쪽은 `townMask`로 높이 0. 걷기는 기존 구역 판정 다음에 `openWalk`(물가 2.5m · 경사 · `BLOCKS` 상자 · 상점 건물). 새 건물을 세우면 `BLOCKS`에 발자리를 넣어요. 숲은 `buildForest`(InstancedMesh). 항구는 `BREAKWATERS` · `buildCoast`, 배 길은 `BOAT_ROUTE` · `boatRoute(q)`.
- **낭만포차거리** (v1.45): `POCHA`(8동, `POCHA_Z(i)`), `buildPocha` · `buildStallCounter`. `STALLS[i]`가 포차 카운터 자리(사장님 의자 = x - .95). 바깥 테이블은 `TABLES()`.
- **어촌 수산시장** (v1.46 새로): `FMKT`(건물 범위 · `door` · `npc`), `buildFishMarket`, 지붕 `FMKT_ROOF`(간판 포함, 안에 들어가면 숨김 `marketRoofTick`), 매대 · 수조의 3D 물고기는 `decorateFishMarket`(모델 준비 뒤). **도매상 NPC** `WHOLESALER` · `buildWholesaler` · `wholesalerFace(mood)`(얼굴 캔버스) · `wholesalerTick` · 대화창 `SHEETS.wholesale = wholesaleSheet`(v1.47: 말 + 가방 물고기 팔기만)(SHEETS 선언 뒤에 등록해야 해요).
- **윗마을 공원** (v1.46): 동사무소 · 부동산 · 주택가 대문은 지었던 코드만 빠졌어요(`OFFICE` · `REALTY` 상수는 남아 있음, 직업 창구 `goOffice`는 시트만 열어요). 공원 소품 `UP_PARK` · `UP_PARK_SOLID`.
- **건물 질감 (필수 · 사용자 요청)**: 새 건물 · 고친 건물은 벽에 `wallTex(kind)`(granite/brick/tile/siding/panel/plaster, 옆면 크기에 맞춰 `repeat`), 창에 `glassMat()`(쇼윈도) · `winMat(낮, 밤)`(밤에 불 켜지는 창)을 꼭 써요. 상점가 외관은 `SHOP_LOOK` · `FACADE[id](g, H, dg)`.
- ⚠ **합칠 때 주의**: 올리기 전에 꼭 최신 `main`을 받아서 그 위에 고쳐요. 옛 파일 위에서 고친 `index.html`을 통째로 올리면 그사이 다른 쪽이 넣은 기능이 사라져요(v1.79 질감 · v1.84.2 TV 가림이 이렇게 두 번 빠졌어요).
- **로또 · TV** (v1.83): `L645`(가격 · 한도 · 상금) · `drawNums(day)`(날짜로 정해진 번호) · `saleDraw` · `ballsShown` · `lottoSettle`(8초마다 자동 정산) · `P.lotto6`. TV는 `TV` · `buildTV` · `tvTick`(유튜브 iframe을 화면 네 점에 `quadMatrix`로 겹치고, postMessage로 볼륨) · `drawTVCanvas` · 확성기 소리 `paBus`/`paChime`/`tvHum`/`paSay`. 영상은 `config/tv` {vid, startAt}.
- **맵 v1.49**: 일주도로 `RING`(점 1.5m 간격 · `RING.h` 높이 · `roadNear(x,z)` 버킷 검색 · `buildRingRoad`), 마을 큰길 구간 `onMainSt`. 지형은 `terNat`(자연) → `terRaw`(도로 둘레 평탄화), 남쪽 해변 `southBeach`, 갯벌 만 `coveH`(섬 다각형이 만을 감싸요). 땅 높이는 `groundY` 하나: 갯벌/모래 → 데크(`onDeck`) → 도로 → 마을 평지(`inTownFlat` = 0) → 지형. 낭만 부두는 `PIER`(옛 좌표 + dx, dz) · `onPier`, 항구 잔교 `JETTY`. 어촌역 `STN` · `buildStation`, 입장 위치 `STATION`.
- **진짜 바다 판정** (v1.48.1): `openSea(x, z, 여유)` — 섬 · 갯벌 해변(`mudX`) · 부두 · 방파제를 빼요. 바다에 무언가를 띄울 땐 이걸로 확인해요(뛰어오르는 물고기 `updateJumps`가 씀).
- **아래 막대 감정표현** (v1.47): `QUICK_DEF`에 `emote`(→ 숨은 `#emoteBtn` 클릭 → `#emotePop`). 이모지 아이콘(v1.46)은 되돌렸어요.
- **지도** (v1.45): 마을 `MAP` · `drawTownMap`, 섬 전체 `IMAP` · `drawIslandMap`(`S.mapMode`).
  - 잠긴 기능의 도전과제(집 · `job1`)는 `ACH`에서 빠져요.
- **돈이 과하게 풀리지 않게** (v1.23.0): 공짜 돈(출석 · 보물 상자 · 초대 · 예금 이자 · 도전과제)은 낚시 벌이(초반 한 시간 ≈ 27만원)를 넘지 않게 맞췄어요. 새 보상을 넣을 때도 이 기준으로 봐요.
- **물고기 시세** (v1.26): 물고기를 파는 곳은 모두 `fishSell(item)`을 써요(= `sellValue(price × fishMul(fishId))`). 새로 파는 곳을 만들면 이걸 써요. 시세는 `rawFishMul`(날짜 + 물고기 해시), 오늘의 생선은 `todayFish()` ×1.5. 조개 · 회(노점)는 시세와 따로예요.
- **내 포차(식당) 1단계 (v1.50)**: 상수표 `REST_CFG` · `REST_LV` · `RECIPES`와 저장 `normRest`(P.rest: lv · unlocked · plates/sales/tips · day · kitchen{hand · board · boil · fry · grill · plate})는 `normProfile` 바로 앞에, 나머지는 「식당」 블록(`buildRestScene` · `restUse` 스테이션 상태머신 · `restTick` 손님/티켓 · `serveDish` · `restBookSheet` · `restFridgeSheet`). 실내는 집과 같은 「안」 모드를 써요: `S.homeHost = "rest"`(`atRest()`), 원점 `REST_CFG.O`(600, 300), `restWalkable`. 들어갈 때 포차 문서(`stallEdit`)에 owner를 써서 간판에 이름이 뜨고, presence는 문 앞 좌표만 보내요. 에셋 `a/rest/`(kaykit glTF · dish glb · snd mp3+ogg), `sfx("rest/snd/…")`는 ogg 못 트는 기기에서 mp3. 마진 검산 `restVerify()`(빈 배열 = 통과).
- **식당 2단계 (v1.55)**: `REST_LV`(cost · hire · tickets · tip · price · opex · seats) · `REST_STAFF`(hire · wage · speed · can · perfect · up). 알바 AI = `restStaffTick` → `staffStep`(역할별 우선순위, `doIt`으로 속도만큼 기다렸다 실행), 접시 호환 `plateCompatible`. 정산 `restSettle`은 `restDay()`가 날이 바뀔 때 불러요. 장사 시작/종료 `setRestOpen`(v1.54 원 작업자 기능을 위 막대 `updateRestBar`에 합쳤어요 — 같은 id `restBar` 두 개가 겹쳐 창이 안 뜨던 원인). NPC 몸(`makeBody`)에는 손이 없어요 — 몸짓은 rig.rotation으로.
- **메뉴 · 크기 (v1.43)**: 메인 메뉴 = `ME_ACTIONS`(캐릭터 둘레, `openMeMenu` · 아래 막대 `#menuBtn`). 새 창 `SHEETS.community` · `SHEETS.achieve`(빨간 숫자 `achieveBadge()`). 아래 막대는 `QUICK_DEF` 고정(`normQuick`이 늘 그 목록 · 퀵바 꾸미기 창 · 꾹 누르기 삭제). 크기는 `rollSizeK`(파레토 꼬리 · `SIZE_MAX` 100), 값은 `sizePriceMul`. 저장 · 기록의 k 상한도 100으로 올렸어요.
- **v1.42 정리**: 마우스 고정 시점 코드는 지웠어요. 입질 속도는 늘 `S.speed = "test"`, 자동 챔질 `S.auto = false`(멍 모드만 자동), 자동 판매 없앰(`P.autoSell`은 남아 있지만 안 써요). 달리기는 `S.keyHold > 1`(WASD 1초) · 조이스틱 · 먼 걷기만. 우리 집은 `isLocked("home")`이 늘 참이고 들어가는 버튼을 모두 지웠어요(집 코드는 남아 있어요 — 되살릴 땐 들어가는 버튼부터). 도감은 `dexTile` · `dexDetail`(`S.dexSel`) · CSS `.dx-*`.
- **채널** (v1.41): `chRoom(room)`이 서버 room을 감싸요 — presence에 `ch`를 달고, `onPeers` · `on`은 내 채널(`S.ch`) 것만 넘겨요(ch 없는 예전 버전 = 1채널). 전체 접속자는 `S.allPeers`, 채널별 인원 `chCounts()`, 입장 때 `pickChannel()`(12명 `CH_MAX`), 옮기기 `moveChannel(c)` → `setChannel(c)`가 `S.watchCh()`로 배 · 노점 문서를 다시 구독해요. 문서 이름은 `boatDocId()` · `stallDocId(i)`. 채팅 문서에 `ch`가 붙고 `S.chatAll` → `S.chat`(내 채널)로 걸러요. 새 실시간 기능을 만들면 `S.room`만 쓰면 채널이 저절로 나뉘어요. 새 "마을 하나에 하나뿐인" 공유 문서를 만들면 채널마다 이름을 다르게 해 주세요.
- **테스트**: `tools/test/mockdb.js`에 가짜 room이 생겼어요 — `window.__peers`(다른 사람)를 바꾸고 `window.__firePeers()`, 신호는 `window.__emitAs(topic, data, peer)`.
- **어두운 리퀴드 글라스** (v1.39): `</style>` 바로 앞 `/* ===== v1.39 어두운 리퀴드 글라스` 블록이 색 변수(`--bg` 반투명 · `--ink` 밝음 · `--lg-*` 유리 재료)를 밝은/어두운 모드 모두 덮어써요(`html:root:not(.lg-x)`로 우선순위를 높였어요). 새 HUD 요소는 `glass` 클래스만 붙이면 같은 유리가 돼요. 밝은 종이 소품을 새로 만들면 그 안에서 `--ink` 등을 진한 값으로 다시 정해 주세요(블록 안 `.passbook,.peg .ishelf…` 줄처럼).
- **낚싯대 3D 모델** (v1.38): `a/rods.json`(14종, `tools/rods_pack.py <팩 zip>`으로 다시 만들어요 · OBJ 번호 01~14 → `RODS` id). 게임에서는 `loadRodModels`(물고기 모델 불러올 때 같이) → `ROD3D` · 그림 `ROD_PIC`(`itemIcon` 낚싯대). 손에 든 낚싯대는 `fitHeldRod(F, rd)`가 막대 낚싯대 대신 모델을 달고 `F.tip`(줄 나오는 곳)과 릴 자리를 맞춰요. 모델의 릴은 손에 들 때 숨기고 내 릴(`F.reelM`)을 달아요.
- **UI 3탄** (v1.37): 아래 막대 칸 색은 `QCOL`(퀵바 꾸미기 화면과 같은 값, `applyQuick`이 `--qc`로 넣어요). 퀵바 꾸미기에서 고른 칸은 `S.qbSel`. CSS는 `/* ===== v1.37 UI 개편 3탄` 블록(`.att2*` 도장판 · `.inv-*` 초대장 · `.qb2-*` 작업대 · `.gd2-*` 수첩). 옛 `.qb-` · `.gd-` · `.attday` CSS는 지웠어요.
- **UI 2탄 공용** (v1.36): `nickAvatar(nick, uid, size)` = 이름 첫 글자 얼굴 동그라미(내 uid나 "me"면 내 얼굴), `nickColor`, `friendStatus(peer)` = 친구가 하는 일 아이콘 · 글. 시트별 CSS는 `/* ===== v1.36 UI 개편 2탄` 블록(`.pcard` · `.pring` 고리(`--p` 0~1) · `.fcard` · `.acard` · `.podium` · `.bagsum` · `.dexsum` · `.setlist`). 도전과제 거르기는 `S.achF`.
- **입장 흐름** (v1.35): `enterGame` → 처음이면 `startCreator`(시트 `creator` + 왼쪽 `#creator` 무대, `S.creating`) → `finishCreator` → `playArrival`(비행기 장면, `S.cut` · `arrivalCam` · 그동안 안개를 멀리) → `doEnter`. 다시 오면 바로 `doEnter`. **역은 `STATION = { x, z, ry }`만 정하면** 거기서 걸어 나와요. `P.made` = 캐릭터 만들기 마침. 마우스 고정 시점은 `S.mouseLook` · `mouseLocked` · `unlockMouse`(창 · 안내 카드가 뜨면 풀어요).
- **내 횟집** (v1.28, 운영자 결정: 이 게임의 메인 재미): 회 값은 `dishPrice` = 기본 판매가 × `DISH_MUL`(1.5) 고정, 가격 입력 없음. 영업 손님 줄은 `S.guests`(사장님 화면에만) · `guestTick`(0.5초) · `serveGuest` · `renderGuests`(바뀐 것만 다시 그림). 평판 · 꾸미기는 `P.shop` · `SHOP_UPG` · `REP_STARS`. 알바 영업은 `npcVisit`.
- **손맛 · 장비** (v1.27): 싸움 시작 상태는 `reelInit(r, opts, g)`(화면과 따로), 한 걸음은 `fightStep(dt, R)`. 장비 수치는 `gearStats(ov)`(ov 로 가상의 장비도 계산). 낚싯대 특성은 `ROD_PERK`(jump · calm · tire). 상점 「예상 성공률」은 `simRate`가 같은 난수로 120번 돌려요 — `TIER_FIGHT`나 장비를 고치면 상점에서 숫자를 확인해요.
- **이펙트**: `spawnCatchFx(x, z, tier, today)` · `updateFx` (loop3D). 화면 빛남은 CSS 클래스 `g3` `g4` `g5` `gtoday`.
- **새 물고기 모델**은 `fish/models2.json`(2묶음, 나중에 불러옴)에 넣어요. `BUILTIN` 항목에 `pack: 2`를 달면 2묶음에서 찾아요. 모델은 CC0만 쓰고 `credits/`에 기록해요.

- **직업은 부수입 방식**이에요. 낚시 · 갯벌 · 밭은 누구나 할 수 있어요.
  - 직업은 횟집 사장 · 해녀 · 농부 · 포차 사장 · 목수 5개예요. **어부는 뺐어요.**
  - 지금 열린 직업은 횟집 사장뿐이에요.
- **「할아버지 평가」 같은 평가 시스템은 하지 않기로** 했어요. 동기 부여 작업은 보류예요.
- **채팅**은 들어온 뒤의 대화만 보여요(나가면 초기화).
- **하루는 실제 한국 시간**이에요. 하늘은 부드럽게 바뀌어요.
- **돈은 원화로 보여요.** 체감 금액은 실제와 비슷하게.
- **낚시**: 등급별 난이도 차이가 확실해야 해요. 물고기와 등급은 다양하게.
  - 모델이 없으면 직접 만들되, 퀄리티 있게 못 하겠으면 하지 않아요.
- 방류소 후원 금액은 최대 10만원(실제 돈)이에요.

## 7. 남은 일 (우선순위 순)

| 순위 | 할 일 | 메모 |
|---|---|---|
| 1 | **가게마다 고유한 화면** (보기와 쓰임 모두) | 특히 **얼굴 꾸미기가 불편**하대요. 큰 캔버스 하나, 부위 레이어, 좌우 대칭 그리기, 되돌리기, 굵기, 지우개, 프리셋, 실시간 3D 미리보기를 추천해요. 낚시 상점 · 회 센터 · 방류소 등도 다 비슷한 목록 화면이라 가게 느낌을 살려요 |
| 2 | **맵 외관 다듬기** | 윗마을(동사무소 · 부동산 · 주택가 대문), 명예의 전당 광장, 집 마당. 나무 · 가로등 · 화단 · 길 · 분수 등 배치와 동선 |
| 3 | 밭 + 농부 · 포차 사장 (기획 3단계) | 집 마당 텃밭 자리(`plotsAt`)가 이미 있어요. 작물 8종 기획은 기획안 문서에 있어요(운영자에게 링크 요청) |
| 4 | 함께 살기(전입신고) + 해녀 · 목수 (기획 4단계) | 동사무소 「전입·전출」 탭이 자리만 있어요 |
| 보류 | 동기 부여 시스템 | 평가 방식은 싫대요. 다른 방식은 운영자와 다시 상의 |

## 8. 알려진 문제 · 주의

- **보안 규칙 배포 권한**: GitHub Actions 서비스 계정에 `Firebase Rules Admin`, `Firebase Realtime Database Admin` 역할이 없으면 규칙 배포 단계가 실패해요. 사이트 배포는 돼요.
  - 운영자에게 IAM에서 역할을 추가하거나 `firebase deploy --only firestore:rules,database`를 직접 실행해 달라고 안내해요.
  - 규칙이 서버에 없으면 웹판에서 집 · 방명록 · 제보 · 채팅 금지가 거부될 수 있어요.
- **골드와 진행은 클라이언트가 계산해요.** 조작을 막는 서버가 없어서 경제 기능에는 상한을 둬요.
- `web/public/firebase-config.js`에는 실제 설정값이 들어 있어요. 견본으로 덮어쓰지 않아요.
- 아티팩트판 db 규칙은 `capabilities.db.rules`에 있어요. 원 작업자 계정만 바꿀 수 있어요.
- 휴대폰 화면(390px 폭)에서 HUD가 화면을 가리지 않게 늘 확인해요.
