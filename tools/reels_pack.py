"""릴 3D 모델 팩(OBJ + MTL) → a/reels.json — tools/rods_pack.py와 같은 포맷.

게임 손잡이(릴) 자리 규격으로 구워 넣어요:
- 스피닝(01·02): 네이티브 +Y=풋(대쪽) · -Z=스풀 방향 → (x,y,z)->(-x,-z,-y)
  풋이 낚싯대(-Z)를 향하고 스풀이 팁(+Y)을 향하게.
- 베이트·전동(03·04): 대 위에 얹는 형 → (x,y,z)->(x,z,-y), 화면·윗면이 +Z.
- 원점 = 바운딩박스 중심, 최대 치수 0.15 (옛 원통 릴 Ø0.15와 같은 볼륨).
"""
import base64, json, pathlib, re, struct, sys, zipfile

IDS = {1: "basic", 2: "spin", 3: "bait", 4: "power"}
ROT = {  # 네이티브 축 -> 게임 릴 자리 축 (회전 행렬, 행 우선) · 실측: 스피닝은 풋이 -Y·스풀이 -Z, 베이트·전동은 풋이 -Z
    "basic": [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    "spin":  [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    "bait":  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    "power": [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
}
TARGET = 0.15

def hexc(vals):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(float(v) * 255))) for v in vals)

def parse_mtl(text):
    mats, cur = {}, None
    for line in text.splitlines():
        p = line.split()
        if not p: continue
        if p[0] == "newmtl": cur = mats.setdefault(p[1], {"c": "#cccccc", "o": 1.0, "e": None, "ns": 20.0})
        elif cur is None: continue
        elif p[0] == "Kd": cur["c"] = hexc(p[1:4])
        elif p[0] == "Ke": cur["e"] = hexc(p[1:4])
        elif p[0] == "d": cur["o"] = float(p[1])
        elif p[0] == "Ns": cur["ns"] = float(p[1])
    return mats

def parse_obj(text):
    vs, parts, mat = [], {}, None
    for line in text.splitlines():
        if line.startswith("v "):
            vs.append(tuple(float(x) for x in line.split()[1:4]))
        elif line.startswith("usemtl "):
            mat = line.split()[1]
        elif line.startswith("f "):
            idx = [int(t.split("/")[0]) for t in line.split()[1:]]
            idx = [i - 1 if i > 0 else len(vs) + i for i in idx]
            tris = parts.setdefault(mat, [])
            for k in range(1, len(idx) - 1):
                tris += [idx[0], idx[k], idx[k + 1]]
    return vs, parts

def b64(fmt, arr):
    return base64.b64encode(struct.pack("<%d%s" % (len(arr), fmt), *arr)).decode()

def main(zpath, out):
    z = zipfile.ZipFile(zpath)
    names = z.namelist()
    mtl_name = next(n for n in names if n.endswith(".mtl"))
    mats = parse_mtl(z.read(mtl_name).decode("utf8"))
    pack = {}
    for n in sorted(names):
        m = re.match(r"(?:.*/)?(\d\d)_[^/]+\.obj$", n)
        if not m: continue
        rid = IDS[int(m.group(1))]
        vs, parts = parse_obj(z.read(n).decode("utf8"))
        R = ROT[rid]
        vs = [tuple(sum(R[r][k] * v[k] for k in range(3)) for r in range(3)) for v in vs]
        lo = [min(v[i] for v in vs) for i in range(3)]
        hi = [max(v[i] for v in vs) for i in range(3)]
        cen = [(lo[i] + hi[i]) / 2 for i in range(3)]
        s = TARGET / max(hi[i] - lo[i] for i in range(3))
        vs = [tuple((v[i] - cen[i]) * s for i in range(3)) for v in vs]
        lo = [min(v[i] for v in vs) for i in range(3)]
        hi = [max(v[i] for v in vs) for i in range(3)]
        sc = [(hi[i] - lo[i]) / 65534 or 1e-6 for i in range(3)]
        q = [round((v[i] - lo[i]) / sc[i]) - 32767 for v in vs for i in range(3)]
        groups = []
        for mt, tris in sorted(parts.items(), key=lambda kv: kv[0] or ""):
            mm = mats.get(mt, {"c": "#cccccc", "o": 1.0, "e": None, "ns": 20.0})
            g = {"c": mm["c"], "i": b64("H", tris)}
            if mm["o"] < 1: g["o"] = mm["o"]
            if mm["e"]: g["e"] = mm["e"]
            if mm["ns"] >= 60: g["s"] = 1
            groups.append(g)
        pack[rid] = {"lo": [round(x, 5) for x in lo], "sc": sc, "len": round(hi[1] - lo[1], 4),
                     "v": b64("h", q), "g": groups}
        print(rid, n, "정점", len(vs), "삼각형", sum(len(t) for t in parts.values()) // 3,
              "크기", [round(hi[i] - lo[i], 3) for i in range(3)])
    pathlib.Path(out).write_text(json.dumps(pack, separators=(",", ":")))
    print("->", out, pathlib.Path(out).stat().st_size, "bytes")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
