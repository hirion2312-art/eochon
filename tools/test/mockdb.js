(() => {
  const store = new Map(), subs = [];
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const notify = () => setTimeout(() => subs.forEach(s => s.run()), 5);
  const colDocs = (path) => { const pre = path + "/", out = []; for (const [k, v] of store) if (k.startsWith(pre) && !k.slice(pre.length).includes("/")) out.push({ id: k.slice(pre.length), data: () => clone(v) }); return out; };
  const query = (path, q) => { let d = colDocs(path); for (const [f, op, val] of q.where || []) d = d.filter(x => op === "<" ? x.data()[f] < val : op === "==" ? x.data()[f] === val : true); if (q.order) { const [f, dir] = q.order; d.sort((a, b) => (a.data()[f] > b.data()[f] ? 1 : -1) * (dir === "desc" ? -1 : 1)); } return q.limit ? d.slice(0, q.limit) : d; };
  const col = (path, q = {}) => ({ orderBy: (f, dir) => col(path, { ...q, order: [f, dir] }), limit: (n) => col(path, { ...q, limit: n }), where: (f, op, v) => col(path, { ...q, where: [...(q.where || []), [f, op, v]] }),
    get: async () => ({ docs: query(path, q) }), add: async (data) => { const id = Math.random().toString(36).slice(2, 10); store.set(path + "/" + id, clone(data)); notify(); return { id }; },
    doc: (id) => doc(path + "/" + id), onSnapshot: (fn) => { const s = { run: () => fn({ docs: query(path, q), metadata: { fromCache: false } }) }; subs.push(s); setTimeout(s.run, 10); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; } });
  const doc = (path) => ({ get: async () => ({ exists: store.has(path), data: () => clone(store.get(path) || {}) }),
    set: async (d) => { store.set(path, clone(d)); notify(); }, update: async (d) => { store.set(path, { ...(store.get(path) || {}), ...clone(d) }); notify(); },
    delete: async () => { store.delete(path); notify(); }, acquire: async () => ({ acquired: true }),
    onSnapshot: (fn) => { const s = { run: () => fn({ exists: store.has(path), data: () => clone(store.get(path) || {}) }) }; subs.push(s); setTimeout(s.run, 10); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; } });
  const db = { doc, collection: col };
  const user = { id: async () => "u_owner0000000000000001", isOwner: async () => true };
  // 가짜 room: window.__peers(다른 사람 목록)를 바꾸고 window.__firePeers()로 알려요
  const me = { peer: "pme", by: "u_owner0000000000000001", kind: "viewer", sameTab: true, presence: {} }, topics = new Map();
  window.__peers = []; let peersFn = null;
  window.__firePeers = (left) => peersFn && peersFn({ peers: [me, ...window.__peers], left: left || [] });
  const room = {
    presence: async (patch) => { for (const [k, v] of Object.entries(patch || {})) { if (v == null) delete me.presence[k]; else me.presence[k] = v; } window.__firePeers(); },
    onPeers: (fn) => { peersFn = fn; setTimeout(window.__firePeers, 10); return () => {}; },
    on: (t, fn) => { topics.set(t, (topics.get(t) || []).concat(fn)); return () => {}; },
    emit: async (t, data) => { (topics.get(t) || []).forEach(fn => fn({ peer: "pme", by: me.by, data: clone(data), sameTab: true, ts: Date.now() })); },
  };
  window.__me = me; window.__emitAs = (t, data, peer) => (topics.get(t) || []).forEach(fn => fn({ peer: peer || "pX", by: "u_x", data, sameTab: false, ts: Date.now() }));
  window.claude = { use: async (n) => n === "db" ? db : n === "user" ? user : n === "room" ? room : null };
  window.__store = store;
})();
