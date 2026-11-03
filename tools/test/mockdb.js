(() => {
  const store = new Map(), subs = [];
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const notify = () => setTimeout(() => subs.forEach(s => s.run()), 5);
  const colDocs = (path) => { const pre = path + "/", out = []; for (const [k, v] of store) if (k.startsWith(pre) && !k.slice(pre.length).includes("/")) out.push({ id: k.slice(pre.length), data: () => clone(v) }); return out; };
  const query = (path, q) => { let d = colDocs(path); for (const [f, op, val] of q.where || []) d = d.filter(x => op === "<" ? x.data()[f] < val : op === "==" ? x.data()[f] === val : true); if (q.order) { const [f, dir] = q.order; d.sort((a, b) => (a.data()[f] > b.data()[f] ? 1 : -1) * (dir === "desc" ? -1 : 1)); } return q.limit ? d.slice(0, q.limit) : d; };
  const col = (path, q = {}) => ({ orderBy: (f, dir) => col(path, { ...q, order: [f, dir] }), limit: (n) => col(path, { ...q, limit: n }), where: (f, op, v) => col(path, { ...q, where: [...(q.where || []), [f, op, v]] }),
    get: async () => ({ docs: query(path, q) }), add: async (data) => { const id = Math.random().toString(36).slice(2, 10); store.set(path + "/" + id, clone(data)); notify(); return { id }; },
    doc: (id) => doc(path + "/" + id), onSnapshot: (fn) => { const s = { run: () => fn({ docs: query(path, q), metadata: { fromCache: false } }) }; subs.push(s); setTimeout(s.run, 10); return () => {}; } });
  const doc = (path) => ({ get: async () => ({ exists: store.has(path), data: () => clone(store.get(path) || {}) }),
    set: async (d) => { store.set(path, clone(d)); notify(); }, update: async (d) => { store.set(path, { ...(store.get(path) || {}), ...clone(d) }); notify(); },
    delete: async () => { store.delete(path); notify(); }, acquire: async () => ({ acquired: true }),
    onSnapshot: (fn) => { const s = { run: () => fn({ exists: store.has(path), data: () => clone(store.get(path) || {}) }) }; subs.push(s); setTimeout(s.run, 10); return () => {}; } });
  const db = { doc, collection: col };
  const user = { id: async () => "u_owner0000000000000001", isOwner: async () => true };
  window.claude = { use: async (n) => n === "db" ? db : n === "user" ? user : null };
  window.__store = store;
})();
