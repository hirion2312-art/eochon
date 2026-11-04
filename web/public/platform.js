/* 어촌생활 · 웹사이트판 플랫폼 어댑터 (Firebase)
   게임 코드는 Claude 아티팩트의 window.claude.use("db" | "user" | "room") API를 그대로 쓰고,
   이 파일이 그 API를 Firebase(로그인 · Firestore · Realtime Database)로 이어 줘요.
   - db   → Firestore (문서 경로가 그대로: data/users/<uid>/profile, chat, stalls/s0 …)
   - user → Firebase 로그인 (구글 · 카카오(OIDC) · 게스트)
   - room → Realtime Database (presence/<탭>, events/<주제>) : 지금 접속한 사람 · 실시간 신호 */
(function () {
  "use strict";
  const cfg = window.EOCHON_FIREBASE || {};
  if (!window.firebase || !cfg.apiKey || /여기에/.test(cfg.apiKey)) {
    console.warn("[어촌생활] firebase-config.js가 비어 있어서 혼자 모드로 실행돼요");
    return;   // window.claude가 없으면 게임은 혼자 모드(브라우저 저장)로 돌아가요
  }
  firebase.initializeApp(cfg);
  const auth = firebase.auth(), fs = firebase.firestore(), rtdb = firebase.database();
  const clean = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));   // Firestore는 undefined를 못 받아요
  let readyResolve; const ready = new Promise((r) => { readyResolve = r; });
  let serverOffset = 0; rtdb.ref(".info/serverTimeOffset").on("value", (s) => { serverOffset = s.val() || 0; });
  const now = () => Date.now() + serverOffset;
  window.WEB_NEED_LOGIN = true;

  /* ---------- db: Firestore를 아티팩트 db 모양으로 ---------- */
  async function acquire(path, o) {   // 짧은 임대(잠금): _locks/<경로> 문서를 트랜잭션으로 차지
    const lock = fs.collection("_locks").doc(path.replace(/\//g, "~")), holder = String((o && o.holder) || ""), ttl = Math.min(600000, Math.max(1000, (o && o.ttlMs) || 30000));
    try {
      return await fs.runTransaction(async (tx) => {
        const s = await tx.get(lock), t = now(), d = s.exists ? s.data() : null;
        if (d && d.holder !== holder && d.exp > t) return { acquired: false, expiresAt: new Date(d.exp).toISOString() };
        tx.set(lock, { holder, exp: t + ttl });
        return { acquired: true, holder, expiresAt: new Date(t + ttl).toISOString() };
      });
    } catch (e) { console.warn("lock", e); return { acquired: false }; }
  }
  const wrapDoc = (ref) => ({
    id: ref.id, path: ref.path,
    get: () => ref.get(), set: (d) => ref.set(clean(d)), update: (d) => ref.update(clean(d)), delete: () => ref.delete(),
    onSnapshot: (next, err) => ref.onSnapshot(next, err || ((e) => console.warn(ref.path, e))),
    acquire: (o) => acquire(ref.path, o),
  });
  const wrapQuery = (q, col) => ({
    orderBy: (f, dir) => wrapQuery(q.orderBy(f, dir), col), limit: (n) => wrapQuery(q.limit(n), col), where: (f, op, v) => wrapQuery(q.where(f, op, v), col),
    get: () => q.get(), onSnapshot: (next, err) => q.onSnapshot(next, err || ((e) => console.warn(col.path, e))),
    add: (d) => col.add(clean(d)), doc: (id) => wrapDoc(col.doc(id)),
  });
  const db = { doc: (p) => wrapDoc(fs.doc(p)), collection: (p) => { const c = fs.collection(p); return wrapQuery(c, c); } };

  /* ---------- user ---------- */
  const userApi = {
    id: async () => auth.currentUser && auth.currentUser.uid,
    isOwner: async () => { try { return (await fs.doc("admins/" + auth.currentUser.uid).get()).exists; } catch { return false; } },
    canEdit: async () => userApi.isOwner(),
    me: async () => ({ id: auth.currentUser.uid, name: auth.currentUser.displayName || "" }),
  };

  /* ---------- room: 지금 접속한 사람(presence) · 실시간 신호(events) ---------- */
  const myPeer = "p" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const myRef = () => rtdb.ref("presence/" + myPeer);
  let myPres = {}, joined = false, lastPeers = new Map();
  const writePres = () => { const u = auth.currentUser; if (!u || !joined) return Promise.resolve(); return myRef().set({ by: u.uid, kind: "viewer", ts: firebase.database.ServerValue.TIMESTAMP, presence: clean(myPres) }); };
  rtdb.ref(".info/connected").on("value", (s) => { if (s.val() === true && joined) { myRef().onDisconnect().remove(); writePres(); } });
  const room = {
    presence(patch) {
      for (const [k, v] of Object.entries(patch || {})) { if (v === null || v === undefined) delete myPres[k]; else myPres[k] = v; }
      if (!joined) { joined = true; myRef().onDisconnect().remove(); }
      return writePres();
    },
    onPeers(fn, err) {
      // 사람이 많으면 움직임마다 전체 목록을 다시 계산하지 않도록 0.12초에 한 번만 모아서 넘겨요
      let pend = null, timer = 0;
      const flush = () => { timer = 0; const snap = pend; pend = null; if (!snap) return;
        const v = snap.val() || {}, uid = auth.currentUser && auth.currentUser.uid, cur = new Map();
        for (const [peer, d] of Object.entries(v)) if (d && typeof d === "object") cur.set(peer, { peer, by: d.by || null, kind: d.kind || "viewer", presence: d.presence || {}, sameTab: peer === myPeer, isMe: d.by === uid });
        const left = [...lastPeers.keys()].filter((k) => !cur.has(k)).map((k) => lastPeers.get(k));
        lastPeers = cur; fn({ peers: [...cur.values()], left });
      };
      rtdb.ref("presence").on("value", (snap) => { pend = snap; if (!timer) timer = setTimeout(flush, lastPeers.size > 20 ? 200 : 120); }, (e) => { console.warn("presence", e); if (err) err(e); });
      return () => rtdb.ref("presence").off();
    },
    on(topic, fn, err) {
      const seen = new Set();
      rtdb.ref("events/" + topic).orderByChild("ts").startAt(now() - 15000).on("child_added", (s) => {
        const d = s.val(); if (!d || seen.has(s.key)) return; seen.add(s.key);
        fn({ peer: d.peer, by: d.by, data: d.data, sameTab: d.peer === myPeer, ts: d.ts });
      }, (e) => { console.warn("events", e); if (err) err(e); });
      return () => rtdb.ref("events/" + topic).off();
    },
    emit(topic, data) {
      const u = auth.currentUser; if (!u) return Promise.resolve();
      const r = rtdb.ref("events/" + topic).push();
      setTimeout(() => r.remove().catch(() => {}), 30000);   // 30초 뒤 정리
      return r.set({ peer: myPeer, by: u.uid, data: clean(data), ts: firebase.database.ServerValue.TIMESTAMP });
    },
  };
  window.claude = { use: async (name) => { await ready; return name === "db" ? db : name === "user" ? userApi : name === "room" ? room : null; } };

  /* ---------- 로그인 화면 (메인 화면 카드 안) ---------- */
  const css = document.createElement("style");
  css.textContent = `.tlogin{display:flex;flex-direction:column;gap:8px}.tlogin .tl-t{font-family:var(--f-display);font-size:17px}
  .tlogin button{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;padding:12px;font-size:15px;font-weight:700;cursor:pointer}
  .tlogin .g{background:#fff;color:#1f1f1f}.tlogin .k{background:#fee500;color:#191600}.tlogin .a{background:rgba(255,255,255,.12);color:var(--hud-ink);border:1px solid var(--glass-line)}
  .tlogin button:disabled{opacity:.6}.tlogin .tl-n{font-size:11.5px;color:var(--hud-muted);line-height:1.5}.tlogin .tl-e{font-size:12px;color:#ff8a6a}`;
  document.head.appendChild(css);
  const G_ICON = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
  const providerLabel = (u) => { if (!u) return ""; if (u.isAnonymous) return "게스트"; const pid = (u.providerData[0] || {}).providerId || ""; return pid.includes("google") ? "구글 계정" : pid.includes("kakao") ? "카카오 계정" : "계정"; };
  async function signIn(kind) {
    const prov = kind === "google" ? new firebase.auth.GoogleAuthProvider() : kind === "kakao" ? new firebase.auth.OAuthProvider("oidc.kakao") : null;
    if (!prov) return auth.signInAnonymously();
    try { return await auth.signInWithPopup(prov); }
    catch (e) { if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) return auth.signInWithRedirect(prov); throw e; }
  }
  function showLogin() {
    const card = document.querySelector(".tcard"); if (!card || document.getElementById("tLogin")) return;
    const box = document.createElement("div"); box.id = "tLogin"; box.className = "tlogin";
    box.innerHTML = '<div class="tl-t">로그인하고 시작해요</div>' +
      '<button class="g" data-p="google">' + G_ICON + '구글로 시작</button>' +
      (cfg.kakao ? '<button class="k" data-p="kakao"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191600" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.4 0 .9.1 1.3.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>카카오로 시작</button>' : "") +
      '<button class="a" data-p="guest">게스트로 둘러보기</button>' +
      '<div class="tl-n">구글·카카오로 시작하면 어느 기기에서든 진행이 이어져요. 게스트는 이 브라우저에만 남고, 나중에 ⚙ 설정에서 구글 계정에 연결할 수 있어요.</div><div class="tl-e" hidden></div>';
    card.insertBefore(box, card.querySelector("#tAcct") || card.firstChild);
    box.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-p]"); if (!b) return;
      box.querySelectorAll("button").forEach((x) => { x.disabled = true; });
      try { await signIn(b.dataset.p); }
      catch (err) { const el = box.querySelector(".tl-e"); el.hidden = false; el.textContent = "로그인하지 못했어요 (" + ((err && err.code) || "오류") + "). 다시 눌러 주세요."; box.querySelectorAll("button").forEach((x) => { x.disabled = false; }); }
    });
  }
  function settingsButtons(u) {
    const pop = document.getElementById("settingsPop"); if (!pop || document.getElementById("webLogout")) return;
    const meta = pop.querySelector(".meta");
    if (u.isAnonymous) {
      const link = document.createElement("button"); link.id = "webLink"; link.innerHTML = "구글 계정에 연결 <span>게스트 진행 지키기</span>";
      link.addEventListener("click", async () => { try { await u.linkWithPopup(new firebase.auth.GoogleAuthProvider()); window.WEB_ACCT = "구글 계정"; link.remove(); alert("구글 계정에 연결했어요. 이제 다른 기기에서도 이어서 할 수 있어요."); } catch (e) { alert("연결하지 못했어요: " + ((e && e.code) || e)); } });
      pop.insertBefore(link, meta);
    }
    const out = document.createElement("button"); out.id = "webLogout"; out.innerHTML = "로그아웃 <span>" + providerLabel(u) + "</span>";
    out.addEventListener("click", async () => { if (u.isAnonymous && !confirm("게스트는 로그아웃하면 진행을 다시 찾을 수 없어요. 그래도 로그아웃할까요?")) return; try { await myRef().remove(); } catch {} await auth.signOut(); location.reload(); });
    pop.insertBefore(out, meta);
  }
  auth.getRedirectResult().catch((e) => console.warn("redirect", e));
  auth.onAuthStateChanged((u) => {
    if (u) {
      window.WEB_NEED_LOGIN = false; window.WEB_ACCT = providerLabel(u);
      const box = document.getElementById("tLogin"); if (box) box.remove();
      settingsButtons(u); readyResolve(u);
    } else { window.WEB_NEED_LOGIN = true; showLogin(); }
  });
})();
