// 기본 점검: 페이지가 오류 없이 뜨고, 입장 → 주요 화면이 열리는지 + 스크린샷
// 사용법: (tools/test/site 에서 http.server 8765 실행 중) node tools/test/smoke.js [출력폴더]
// 볼 화면 바꾸기: SHEETS=shop,clothes,bank node tools/test/smoke.js  ·  다른 포트: PORT=8766 · 소프트웨어 렌더링이라 화면 하나에 10초쯤 걸려요
// Playwright 가 필요해요. 클라우드 세션에는 깔려 있어요: require('playwright')
const { chromium, devices } = require('playwright');
(async () => {
  const out = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, opt] of [['pc', { viewport: { width: 1100, height: 720 } }], ['mobile', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opt); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    await p.goto('http://localhost:' + (process.env.PORT || 8765) + '/index.html', { timeout: 180000 }); await p.waitForTimeout(6000);
    await p.screenshot({ path: `${out}/${name}-title.png` });
    await p.evaluate(() => { const P = window.T.P(); P.tut._off = true; P.tut.welcome = true; P.attend = { n: 7, last: 'x' }; });
    await p.evaluate(() => document.getElementById('tStart').click()); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${name}-street.png` });
    for (const sh of (process.env.SHEETS || 'shop,office,realty').split(',').filter(Boolean)) {
      await p.evaluate((sh) => window.T.open(sh), sh); await p.waitForTimeout(700);
      await p.screenshot({ path: `${out}/${name}-${sh}.png` });
    }
    console.log(name, errs.length ? errs.join('\n') : 'no errors');
    await ctx.close();
  }
  await b.close();
})();
