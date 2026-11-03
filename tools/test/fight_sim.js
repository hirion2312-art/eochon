// 손맛 싸움 균형 시뮬레이션: 등급별 물고기를 「계속 감기」 / 「돌진 때 손 떼기」 전략으로 40번씩 싸워 본 승률·시간
// 사용법: (테스트 서버 실행 중) node tools/test/fight_sim.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.goto('http://localhost:' + (process.env.PORT || 8765) + '/index.html'); await p.waitForTimeout(5000);
  await p.evaluate(() => document.getElementById('tStart').click()); await p.waitForTimeout(500);
  const res = await p.evaluate(() => {
    const T = window.T, out = {}, ids = ["b-bungeo", "b-ureok", "b-chamdom", "b-darangeo", "b-whiteshark", "b-geumdom"];
    for (const gear of ["base", "good"]) {
      T.setP(P => { if (gear === "good") { P.rods.push("iridium"); P.rod = "iridium"; P.reels.push("bait"); P.reel = "bait"; P.lines.push("carbon"); P.line = "carbon"; } else { P.rod = "bamboo"; P.reel = "basic"; P.line = "nylon"; } });
      for (const id of ids) for (const pol of ["hold", "smart"]) {
        let win = 0, tsum = 0, why = {};
        for (let n = 0; n < 40; n++) {
          const f = T.BUILTIN.find(x => x.id === id); T.startReel({ f, k: 1 }); let o = null;
          while (!o && T.REEL.time < 180) { const R = T.REEL; R.hold = pol === "hold" ? true : (R.st === "cruise" || R.st === "tired" || R.st === "dive") && R.heat < .55 && R.tension / R.g.lineMax < .85; R.time += 1 / 60; o = T.fightStep(1 / 60); }
          o = o || "time"; why[o] = (why[o] || 0) + 1; if (o === "land") { win++; tsum += T.REEL.time; } T.endReel(false, true);
        }
        out[gear + " " + id + " " + pol] = "win " + win + "/40 avg " + (win ? (tsum / win).toFixed(0) : "-") + "s " + JSON.stringify(why);
      }
    }
    return out;
  });
  for (const [k, v] of Object.entries(res)) console.log(k.padEnd(30), v);
  await b.close();
})();
