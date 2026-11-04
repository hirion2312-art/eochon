"""헤드리스 테스트용 페이지 만들기.
   index.html 을 tools/test/site/ 에 복사하면서
   - three.js · GLTFLoader 를 CDN 대신 로컬 파일로 (없으면 CDN 그대로)
   - 가짜 서버(mockdb.js: window.claude 의 db·user 를 메모리로 흉내)를 먼저 넣고
   - window.T 에 테스트용 손잡이(S, P, ME, cam, open, 각종 함수)를 달아요.
   사용법: python3 tools/test/make_test_page.py  →  cd tools/test/site && python3 -m http.server 8765
"""
import pathlib, shutil, re
root = pathlib.Path(__file__).resolve().parent.parent.parent
site = root / "tools" / "test" / "site"
site.mkdir(parents=True, exist_ok=True)
s = (root / "index.html").read_text(encoding="utf8")
# three.js 는 vendor/ 의 로컬 사본을 써요 (네트워크가 막힌 환경에서도 돌도록)
s = s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script src="mockdb.js"></script><script src="three.min.js"></script>')
s = s.replace('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>', '<script src="GLTFLoader.js"></script>')
hooks = "S,P:()=>P,ME,cam,open:openSheet,setP:(f)=>f(P),sitNow,claimAttend,claimRef,sendFeedback,boatQuit,myCode,loadRanks,pushRank,setJob,cutSashimi,goOffice,enterHouse,leaveHouse,buyHouse,decoTap,BUILTIN,startReel,REEL,fightStep,endReel,openStall,listDish,npcVisit,SHOPPERS,dishFishValue,npcShopTick,spawnCatchFx,FX,todayFish,fishMul,fishSell,sellItems,landFish,simRate,gearStats,simRates,curGear,serveGuest,guestTick,listDishes,buyShopUpg,dishPrice,cutMany,waitMs,tick,TOWNFOLK,TOWN_NODES,chars:()=>CHARS,townPlan,townPos,walkable,scene:()=>scene,T3:()=>T3,startBreach,breach:()=>BREACH,ACT_FX,curPrice,missFish,hook,setPhase,setQuick,applyQuick,showHelp,FISH3D,fishArt,findFish,SHELLS,terH:(x,z)=>terH(x,z),inIsland:(x,z)=>inIsland(x,z),groundY:(x,z)=>groundY(x,z),camera3:()=>camera,sitAtStall,placeAt,startCreator,finishCreator,playArrival,endArrival,doEnter,STATION,nearestAction,updateActionUI,moveChannel,chCounts,ring:()=>RING,roadNear,inTownFlat,openRest,leaveRest,restUse,restK,RECIPES,recipePrice,restVerify,restTick,rg:()=>RESTG,rm:()=>REST_MODEL,hireStaff,upgradeRest,setRestOpen,restDay,tvSetVideo,serverFull,pickChannel"
i = s.rfind("\nboot();")
assert i > 0, "boot() 호출을 찾지 못했어요"
s = s[:i] + "\nwindow.T={" + hooks + "};boot();" + s[i + len("\nboot();"):]
# artifact 런타임과 같은 껍데기(아티팩트는 게시할 때 감싸 줌)
if not s.lstrip().lower().startswith("<!doctype"):
    s = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + s + "</body></html>"
(site / "index.html").write_text(s, encoding="utf8")
shutil.copy(root / "tools" / "test" / "mockdb.js", site / "mockdb.js")
for f in ["three.min.js", "GLTFLoader.js"]: shutil.copy(root / "tools" / "test" / "vendor" / f, site / f)
for d in ["a", "fish"]:
    if (site / d).exists(): shutil.rmtree(site / d)
    shutil.copytree(root / d, site / d)
print("테스트 페이지 준비:", site / "index.html")
